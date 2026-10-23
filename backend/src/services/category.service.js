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

export const slugify = (text = '') =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getCategories = async ({ flat = false } = {}) => {
  if (Date.now() >= dbDownUntil) {
    try {
      const categories = await prisma.category.findMany({
        where: flat ? {} : { parentId: null },
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        include: {
          parent: true,
          children: {
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
          },
        },
      });

      const activeCounts = await prisma.product.groupBy({
        by: ['categoryId'],
        where: { active: true, categoryId: { not: null } },
        _count: { _all: true },
      });

      const countMap = new Map();
      for (const row of activeCounts) {
        if (row.categoryId) {
          countMap.set(row.categoryId, row._count._all);
        }
      }

      return categories.map((cat) => {
        const directCount = countMap.get(cat.id) || 0;
        const childrenWithCounts = (cat.children || []).map((child) => {
          const cCount = countMap.get(child.id) || 0;
          return {
            ...child,
            productCount: cCount,
            _count: { products: cCount },
          };
        });
        const childrenCount = childrenWithCounts.reduce(
          (sum, child) => sum + child.productCount,
          0
        );
        const totalCount = directCount + childrenCount;

        return {
          ...cat,
          children: childrenWithCounts,
          directProductCount: directCount,
          productCount: totalCount,
          _count: { products: totalCount },
        };
      });
    } catch {
      dbDownUntil = Date.now() + 60000;
    }
  }

  const snap = loadSnapshot();
  const countMap = new Map();
  for (const p of snap.products) {
    if (p.active && p.categoryId) {
      countMap.set(p.categoryId, (countMap.get(p.categoryId) || 0) + 1);
    }
  }

  const allWithCounts = snap.categories.map((cat) => {
    const directCount = countMap.get(cat.id) || 0;
    const childrenWithCounts = (cat.children || []).map((child) => {
      const cCount = countMap.get(child.id) || 0;
      return {
        ...child,
        productCount: cCount,
        _count: { products: cCount },
      };
    });
    const childrenCount = childrenWithCounts.reduce(
      (sum, child) => sum + child.productCount,
      0
    );
    const totalCount = directCount + childrenCount;
    return {
      ...cat,
      children: childrenWithCounts,
      directProductCount: directCount,
      productCount: totalCount,
      _count: { products: totalCount },
    };
  });

  return flat ? allWithCounts : allWithCounts.filter((c) => !c.parentId);
};

export const createCategory = async ({ name, slug, parentId = null, order = 0 }) => {
  const trimmed = name.trim();
  const normalizedParentId = parentId || null;

  const existing = await prisma.category.findFirst({
    where: {
      name: { equals: trimmed, mode: 'insensitive' },
      parentId: normalizedParentId,
    },
  });

  if (existing) {
    throw new Error(`La categoría "${trimmed}" ya existe en este nivel.`);
  }

  let baseSlug = slug ? slugify(slug) : slugify(trimmed);
  if (normalizedParentId) {
    const parent = await prisma.category.findUnique({ where: { id: normalizedParentId } });
    if (parent && !slug) {
      baseSlug = `${parent.slug}-${baseSlug}`;
    }
  }

  let finalSlug = baseSlug || `cat-${Date.now()}`;
  let suffix = 1;
  while (await prisma.category.findUnique({ where: { slug: finalSlug } })) {
    suffix += 1;
    finalSlug = `${baseSlug}-${suffix}`;
  }

  return prisma.category.create({
    data: {
      name: trimmed,
      slug: finalSlug,
      parentId: normalizedParentId,
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
    },
    include: {
      parent: true,
      children: true,
    },
  });
};

export const updateCategory = async (id, data) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new Error('Categoría no encontrada.');
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.parentId !== undefined) updateData.parentId = data.parentId || null;
  if (data.order !== undefined) updateData.order = Number(data.order) || 0;
  if (data.slug !== undefined && data.slug.trim()) {
    updateData.slug = slugify(data.slug);
  }

  return prisma.category.update({
    where: { id },
    data: updateData,
    include: {
      parent: true,
      children: true,
    },
  });
};

export const deleteCategory = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { children: true },
  });

  if (!category) {
    throw new Error('Categoría no encontrada.');
  }

  if (category.children && category.children.length > 0) {
    throw new Error(
      `No se puede eliminar "${category.name}" porque tiene ${category.children.length} subcategoría(s) asociada(s).`
    );
  }

  const associatedProducts = await prisma.product.count({
    where: {
      active: true,
      categoryId: id,
    },
  });

  if (associatedProducts > 0) {
    throw new Error(
      `No se puede eliminar "${category.name}" porque hay ${associatedProducts} producto(s) activo(s) asignado(s).`
    );
  }

  return prisma.category.delete({
    where: { id },
  });
};
