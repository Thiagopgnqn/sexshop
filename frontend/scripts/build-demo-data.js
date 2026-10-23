import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootCsvPath = path.resolve(__dirname, '../../catalogo_demo.csv');
const localCsvPath = path.resolve(__dirname, '../catalogo_demo.csv');
const outputPath = path.resolve(__dirname, '../src/api/demo/demo-data.json');

const slugify = (text = '') =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(content) {
  const clean = content.replace(/^\uFEFF/, '');
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = { _rowNumber: index + 2 };
    headers.forEach((h, i) => {
      row[h] = values[i] !== undefined ? values[i] : '';
    });
    return row;
  });
}

const FEATURED_GROUPS = new Set([
  'Baby Doll Venecia',
  'Body Marley',
  'Aceite comestible Love Potion',
  'Vela de masaje 30 g',
  'Perfume Hot Inevitable',
  'Safary',
]);

function buildDemoData() {
  const csvPath = fs.existsSync(rootCsvPath) ? rootCsvPath : localCsvPath;
  if (!fs.existsSync(csvPath)) {
    throw new Error(`No se encontró catalogo_demo.csv en ${rootCsvPath} ni en ${localCsvPath}`);
  }

  const rawCsv = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCsv(rawCsv);

  // 1. Construir árbol de categorías y subcategorías
  const parentMap = new Map();
  const subMap = new Map();
  const categories = [];
  let parentOrder = 1;

  for (const row of rows) {
    const parentName = (row.categoria || 'General').trim();
    const subName = (row.subcategoria || '').trim();

    if (!parentMap.has(parentName)) {
      const parentCat = {
        id: `cat_${slugify(parentName)}`,
        name: parentName,
        slug: slugify(parentName),
        parentId: null,
        order: parentOrder++,
        children: [],
      };
      parentMap.set(parentName, parentCat);
      categories.push(parentCat);
    }

    if (subName) {
      const parentCat = parentMap.get(parentName);
      const subKey = `${parentName}:::${subName}`;
      if (!subMap.has(subKey)) {
        const subSlug = `${parentCat.slug}-${slugify(subName)}`;
        const subCat = {
          id: `sub_${subSlug}`,
          name: subName,
          slug: subSlug,
          parentId: parentCat.id,
          order: parentCat.children.length + 1,
          parent: {
            id: parentCat.id,
            name: parentCat.name,
            slug: parentCat.slug,
          },
          children: [],
        };
        subMap.set(subKey, subCat);
        parentCat.children.push(subCat);
        categories.push(subCat);
      }
    }
  }

  // 2. Agrupar filas por "grupo"
  const groupsMap = new Map();
  for (const row of rows) {
    const groupKey = (row.grupo || row.nombre).trim();
    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, []);
    }
    groupsMap.get(groupKey).push(row);
  }

  const usedSkus = new Set();
  let autoSkuCounter = 1;
  const ensureUniqueSku = (rawSku) => {
    let base = (rawSku || '').trim();
    if (!base) {
      while (true) {
        const candidate = `DEMO-${String(autoSkuCounter++).padStart(4, '0')}`;
        if (!usedSkus.has(candidate)) {
          usedSkus.add(candidate);
          return candidate;
        }
      }
    }
    if (!usedSkus.has(base)) {
      usedSkus.add(base);
      return base;
    }
    let suffix = 2;
    while (usedSkus.has(`${base}-${suffix}`)) {
      suffix += 1;
    }
    const resolved = `${base}-${suffix}`;
    usedSkus.add(resolved);
    return resolved;
  };

  // 3. Construir productos y variantes
  const products = [];
  let prodIndex = 1;
  let varIndex = 1;

  for (const [groupName, groupRows] of groupsMap.entries()) {
    const first = groupRows[0];
    const parentName = (first.categoria || 'General').trim();
    const subName = (first.subcategoria || '').trim();
    const parentCat = parentMap.get(parentName);
    const assignedCat = subName ? subMap.get(`${parentName}:::${subName}`) : parentCat;

    const hasVariantAttrs = (r) =>
      Boolean(
        r.variante_tipo ||
          r.variante_talle ||
          r.variante_color ||
          r.variante_sabor_aroma ||
          r.variante_volumen_medida
      );

    const isMultiVariant = groupRows.length > 1 || hasVariantAttrs(first);
    const productId = `demo_prod_${String(prodIndex).padStart(3, '0')}_${slugify(groupName)}`;
    const isFeatured = FEATURED_GROUPS.has(groupName);

    const variants = [];
    if (isMultiVariant) {
      for (const r of groupRows) {
        const vSku = ensureUniqueSku(r.sku);
        const vPrice = Number(r.precio_ars || 15000);
        const inferredSize =
          r.variante_talle ||
          (subName === 'Línea Free Size'
            ? 'Free Size'
            : parentName === 'Lencería'
            ? 'Talle Único'
            : null);

        variants.push({
          id: `demo_var_${String(varIndex++).padStart(3, '0')}`,
          productId,
          sku: vSku,
          type: r.variante_tipo || null,
          size: inferredSize,
          color: r.variante_color || null,
          flavor: r.variante_sabor_aroma || null,
          volume: r.variante_volumen_medida || null,
          price: vPrice,
          stock: 10,
          active: true,
        });
      }
    }

    const basePrice =
      variants.length > 0
        ? Math.min(...variants.map((v) => v.price))
        : Number(first.precio_ars || 15000);

    const productSku =
      variants.length > 0
        ? first.sku
          ? `${first.sku.trim()}-GRP`
          : ensureUniqueSku('')
        : ensureUniqueSku(first.sku);

    const totalStock = variants.length > 0 ? variants.length * 10 : 10;

    const defaultDesc =
      first.descripcion ||
      `${groupName} — Selección ${parentName}${subName ? ` (${subName})` : ''}. Empaque 100% discreto.`;

    products.push({
      id: productId,
      name: groupName,
      description: defaultDesc,
      sku: productSku,
      price: basePrice,
      transferPrice: Math.round(basePrice * 0.9),
      stock: totalStock,
      imageUrl: null,
      badge: isFeatured ? 'Destacado' : null,
      featured: isFeatured,
      brand: 'Nocturna',
      categoryId: assignedCat.id,
      category: {
        id: assignedCat.id,
        name: assignedCat.name,
        slug: assignedCat.slug,
        parentId: assignedCat.parentId,
        parent: assignedCat.parent || null,
      },
      active: true,
      soldCount: isFeatured ? 25 - prodIndex : 5,
      createdAt: new Date(Date.now() - prodIndex * 3600 * 1000).toISOString(),
      variants,
    });

    prodIndex += 1;
  }

  const outputData = {
    generatedAt: new Date().toISOString(),
    categories,
    products,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

  console.log(
    `[demo:build-data] Generado ${outputPath}: ${products.length} productos (${
      products.filter((p) => p.featured).length
    } destacados), ${products.reduce((s, p) => s + p.variants.length, 0)} variantes, ${
      categories.filter((c) => !c.parentId).length
    } categorías principales.`
  );
}

buildDemoData();
