import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const snapshotPath = path.resolve(__dirname, '../../prisma/catalog-snapshot.json');

let dbDownUntil = 0;

const loadSnapshot = () => {
  try {
    if (fs.existsSync(snapshotPath)) {
      return JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    }
  } catch {
    // Ignore snapshot read errors
  }
  return { categories: [], products: [] };
};

const productInclude = {
  category: {
    include: {
      parent: true,
    },
  },
  variants: {
    orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
  },
};

export const getProducts = async (filters) => {
  const {
    page = 1,
    limit = 12,
    category,
    subcategory,
    size,
    talle,
    color,
    flavor,
    sabor,
    minPrice,
    maxPrice,
    search,
    sort,
    includeInactive,
  } = filters;

  try {
    if (Date.now() < dbDownUntil) throw new Error('DB_DOWN_CACHED');
    const where = includeInactive === 'true' ? {} : { active: true };
    const andConditions = [];

    if (category) {
      const rawCats = category
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      if (rawCats.length > 0) {
        const catOr = rawCats.flatMap((c) => [
          { categoryId: c },
          { category: { slug: { equals: c, mode: 'insensitive' } } },
          { category: { name: { equals: c, mode: 'insensitive' } } },
          { category: { parentId: c } },
          { category: { parent: { slug: { equals: c, mode: 'insensitive' } } } },
          { category: { parent: { name: { equals: c, mode: 'insensitive' } } } },
        ]);
        andConditions.push({ OR: catOr });
      }
    }

    if (subcategory) {
      const rawSubs = subcategory
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (rawSubs.length > 0) {
        const subOr = rawSubs.flatMap((s) => [
          { categoryId: s },
          { category: { slug: { equals: s, mode: 'insensitive' } } },
          { category: { name: { equals: s, mode: 'insensitive' } } },
        ]);
        andConditions.push({ OR: subOr });
      }
    }

    const sizeFilter = size || talle;
    if (sizeFilter) {
      const sizes = sizeFilter
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (sizes.length > 0) {
        andConditions.push({
          variants: {
            some: {
              active: true,
              OR: sizes.map((s) => ({ size: { equals: s, mode: 'insensitive' } })),
            },
          },
        });
      }
    }

    if (color) {
      const colors = color
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      if (colors.length > 0) {
        andConditions.push({
          variants: {
            some: {
              active: true,
              OR: colors.map((c) => ({ color: { contains: c, mode: 'insensitive' } })),
            },
          },
        });
      }
    }

    const flavorFilter = flavor || sabor;
    if (flavorFilter) {
      const flavors = flavorFilter
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);
      if (flavors.length > 0) {
        andConditions.push({
          variants: {
            some: {
              active: true,
              OR: flavors.map((f) => ({ flavor: { contains: f, mode: 'insensitive' } })),
            },
          },
        });
      }
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      const q = search.trim();
      if (q) {
        andConditions.push({
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { sku: { contains: q, mode: 'insensitive' } },
            {
              variants: {
                some: {
                  sku: { contains: q, mode: 'insensitive' },
                },
              },
            },
          ],
        });
      }
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'best_selling') orderBy = { soldCount: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: productInclude,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };
  } catch (err) {
    dbDownUntil = Date.now() + 60000;
    const snap = loadSnapshot();
    let list = snap.products.filter((p) =>
      includeInactive === 'true' ? true : p.active
    );

    if (category) {
      const rawCats = category
        .split(',')
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean);
      if (rawCats.length > 0) {
        list = list.filter((p) => {
          const cat = p.category;
          if (!cat) return false;
          return rawCats.some(
            (rc) =>
              cat.id?.toLowerCase() === rc ||
              cat.slug?.toLowerCase() === rc ||
              cat.name?.toLowerCase() === rc ||
              cat.parentId?.toLowerCase() === rc ||
              cat.parent?.slug?.toLowerCase() === rc ||
              cat.parent?.name?.toLowerCase() === rc
          );
        });
      }
    }

    if (subcategory) {
      const rawSubs = subcategory
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (rawSubs.length > 0) {
        list = list.filter((p) => {
          const cat = p.category;
          if (!cat) return false;
          return rawSubs.some(
            (rs) =>
              cat.id?.toLowerCase() === rs ||
              cat.slug?.toLowerCase() === rs ||
              cat.name?.toLowerCase() === rs
          );
        });
      }
    }

    const sizeFilter = size || talle;
    if (sizeFilter) {
      const sizes = sizeFilter
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      list = list.filter((p) =>
        (p.variants || []).some(
          (v) => v.active && v.size && sizes.includes(v.size.toLowerCase())
        )
      );
    }

    if (color) {
      const colors = color
        .split(',')
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean);
      list = list.filter((p) =>
        (p.variants || []).some(
          (v) =>
            v.active &&
            v.color &&
            colors.some((c) => v.color.toLowerCase().includes(c))
        )
      );
    }

    const flavorFilter = flavor || sabor;
    if (flavorFilter) {
      const flavors = flavorFilter
        .split(',')
        .map((f) => f.trim().toLowerCase())
        .filter(Boolean);
      list = list.filter((p) =>
        (p.variants || []).some(
          (v) =>
            v.active &&
            v.flavor &&
            flavors.some((f) => v.flavor.toLowerCase().includes(f))
        )
      );
    }

    if (minPrice) {
      list = list.filter((p) => Number(p.price) >= parseFloat(minPrice));
    }
    if (maxPrice) {
      list = list.filter((p) => Number(p.price) <= parseFloat(maxPrice));
    }

    if (search) {
      const q = search.trim().toLowerCase();
      if (q) {
        list = list.filter(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            (p.variants || []).some((v) => v.sku?.toLowerCase().includes(q))
        );
      }
    }

    if (sort === 'price_asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'price_desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === 'best_selling') list.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));

    const total = list.length;
    const pNum = parseInt(page, 10);
    const lNum = parseInt(limit, 10);
    const skip = (pNum - 1) * lNum;

    return {
      products: list.slice(skip, skip + lNum),
      total,
      page: pNum,
      limit: lNum,
    };
  }
};

export const getFilterOptions = async () => {
  try {
    if (Date.now() < dbDownUntil) throw new Error('DB_DOWN_CACHED');
    const variants = await prisma.productVariant.findMany({
      where: {
        active: true,
        product: { active: true },
      },
      select: {
        size: true,
        color: true,
        flavor: true,
      },
    });

    const sizesSet = new Set();
    const colorsSet = new Set();
    const flavorsSet = new Set();

    for (const v of variants) {
      if (v.size && v.size.trim()) sizesSet.add(v.size.trim());
      if (v.color && v.color.trim()) colorsSet.add(v.color.trim());
      if (v.flavor && v.flavor.trim()) flavorsSet.add(v.flavor.trim());
    }

    return {
      sizes: Array.from(sizesSet).sort(),
      colors: Array.from(colorsSet).sort(),
      flavors: Array.from(flavorsSet).sort(),
    };
  } catch {
    const snap = loadSnapshot();
    const sizesSet = new Set();
    const colorsSet = new Set();
    const flavorsSet = new Set();

    for (const p of snap.products) {
      if (!p.active) continue;
      for (const v of p.variants || []) {
        if (!v.active) continue;
        if (v.size && v.size.trim()) sizesSet.add(v.size.trim());
        if (v.color && v.color.trim()) colorsSet.add(v.color.trim());
        if (v.flavor && v.flavor.trim()) flavorsSet.add(v.flavor.trim());
      }
    }

    return {
      sizes: Array.from(sizesSet).sort(),
      colors: Array.from(colorsSet).sort(),
      flavors: Array.from(flavorsSet).sort(),
    };
  }
};

export const getProductById = async (id) => {
  try {
    if (Date.now() < dbDownUntil) throw new Error('DB_DOWN_CACHED');
    const product = await prisma.product.findFirst({
      where: { id, active: true },
      include: productInclude,
    });
    if (!product) throw new Error('Product not found');
    return product;
  } catch (err) {
    if (err.message === 'Product not found') throw err;
    dbDownUntil = Date.now() + 60000;
    const snap = loadSnapshot();
    const found = snap.products.find((p) => p.id === id && p.active);
    if (!found) throw new Error('Product not found');
    return found;
  }
};

export const createProduct = async (data) => {
  const { variants, ...productData } = data;

  const cleanProductData = {
    name: productData.name,
    description: productData.description ?? '',
    sku: productData.sku || null,
    price: productData.price,
    transferPrice: productData.transferPrice ?? null,
    stock: productData.stock ?? 0,
    imageUrl: productData.imageUrl || null,
    badge: productData.badge || null,
    brand: productData.brand || null,
    categoryId: productData.categoryId || null,
    active: productData.active ?? true,
  };

  if (Array.isArray(variants) && variants.length > 0) {
    const validPrices = variants
      .map((v) => Number(v.price))
      .filter((p) => Number.isFinite(p) && p > 0);
    if (validPrices.length > 0) {
      cleanProductData.price = Math.min(...validPrices);
    }
    cleanProductData.stock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }

  return prisma.product.create({
    data: {
      ...cleanProductData,
      ...(Array.isArray(variants) && variants.length > 0
        ? {
            variants: {
              create: variants.map((v) => ({
                sku: v.sku.trim(),
                type: v.type || null,
                size: v.size || null,
                color: v.color || null,
                flavor: v.flavor || null,
                volume: v.volume || null,
                price: v.price,
                stock: v.stock ?? 0,
                active: v.active ?? true,
              })),
            },
          }
        : {}),
    },
    include: productInclude,
  });
};

export const updateProduct = async (id, data) => {
  const { variants, ...productData } = data;

  try {
    if (Date.now() < dbDownUntil) throw new Error('DB_DOWN_CACHED');
    return await prisma.$transaction(async (tx) => {
      const updatePayload = { ...productData };
      delete updatePayload.featured;
      if ('sku' in updatePayload) updatePayload.sku = updatePayload.sku || null;
      if ('categoryId' in updatePayload) updatePayload.categoryId = updatePayload.categoryId || null;
      if ('imageUrl' in updatePayload) updatePayload.imageUrl = updatePayload.imageUrl || null;
      if ('badge' in updatePayload) updatePayload.badge = updatePayload.badge || null;
      if ('brand' in updatePayload) updatePayload.brand = updatePayload.brand || null;

      if (Array.isArray(variants)) {
        if (variants.length > 0) {
          const validPrices = variants
            .map((v) => Number(v.price))
            .filter((p) => Number.isFinite(p) && p > 0);
          if (validPrices.length > 0) {
            updatePayload.price = Math.min(...validPrices);
          }
          updatePayload.stock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
        }

        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id },
        });
        const existingBySku = new Map(existingVariants.map((ev) => [ev.sku, ev]));
        const incomingIds = new Set(
          variants
            .map((v) => v.id || existingBySku.get(v.sku?.trim())?.id)
            .filter(Boolean)
        );

        for (const existing of existingVariants) {
          if (!incomingIds.has(existing.id)) {
            await tx.productVariant.delete({ where: { id: existing.id } }).catch(() => {});
          }
        }

        for (const v of variants) {
          const matchedId = v.id || existingBySku.get(v.sku?.trim())?.id;
          const vData = {
            sku: v.sku.trim(),
            type: v.type || null,
            size: v.size || null,
            color: v.color || null,
            flavor: v.flavor || null,
            volume: v.volume || null,
            price: v.price,
            stock: v.stock ?? 0,
            active: v.active ?? true,
          };
          if (matchedId) {
            await tx.productVariant.update({
              where: { id: matchedId },
              data: vData,
            });
          } else {
            await tx.productVariant.create({
              data: {
                ...vData,
                productId: id,
              },
            });
          }
        }
      }

      return tx.product.update({
        where: { id },
        data: updatePayload,
        include: productInclude,
      });
    });
  } catch (err) {
    dbDownUntil = Date.now() + 60000;
    const snap = loadSnapshot();
    const idx = snap.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    const current = snap.products[idx];
    const updated = {
      ...current,
      ...productData,
      ...(Array.isArray(variants) ? { variants } : {}),
    };
    snap.products[idx] = updated;
    try {
      fs.writeFileSync(snapshotPath, JSON.stringify(snap, null, 2), 'utf-8');
    } catch {
      // ignore write errors
    }
    return updated;
  }
};

export const deleteProduct = async (id) => {
  return prisma.product.update({
    where: { id },
    data: { active: false },
  });
};
