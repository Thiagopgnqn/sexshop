import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const slugify = (text = '') =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(content) {
  const cleanContent = content.replace(/^\uFEFF/, '');
  const lines = cleanContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]);

  return lines.slice(1).map((line, index) => {
    const values = parseCSVLine(line);
    const row = { _rowNumber: index + 2 };
    headers.forEach((header, idx) => {
      row[header] = values[idx] !== undefined ? values[idx] : '';
    });
    return row;
  });
}

async function runImport() {
  const rootDir = path.resolve(__dirname, '../..');
  const csvCandidates = [
    path.join(rootDir, 'catalogo_nocturna.csv'),
    path.resolve(__dirname, '../prisma/catalogo_nocturna.csv'),
  ];
  const csvPath = csvCandidates.find((p) => fs.existsSync(p));

  if (!csvPath) {
    throw new Error('No se encontró el archivo catalogo_nocturna.csv');
  }

  const rawCSV = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(rawCSV);

  const skuOccurrences = new Map();
  for (const row of rows) {
    const rawSku = (row.sku || '').trim();
    if (rawSku) {
      const key = rawSku.toUpperCase();
      skuOccurrences.set(key, (skuOccurrences.get(key) || 0) + 1);
    }
  }

  const skuSeenCount = new Map();
  let autoSkuCounter = 1;

  const duplicateSkusReport = [];
  const generatedSkusReport = [];
  const reviewRowsReport = [];
  const missingPriceReport = [];
  const notesReport = [];

  const processedRows = rows.map((row) => {
    const rawSku = (row.sku || '').trim();
    let finalSku = rawSku;

    if (!rawSku) {
      finalSku = `NOC-${String(autoSkuCounter).padStart(4, '0')}`;
      autoSkuCounter++;
      generatedSkusReport.push({
        rowNumber: row._rowNumber,
        grupo: row.grupo,
        nombre: row.nombre,
        categoria: row.categoria,
        subcategoria: row.subcategoria,
        generatedSku: finalSku,
        nota: row.nota || '',
      });
    } else {
      const key = rawSku.toUpperCase();
      const totalCount = skuOccurrences.get(key) || 1;
      const seen = (skuSeenCount.get(key) || 0) + 1;
      skuSeenCount.set(key, seen);

      if (totalCount > 1) {
        finalSku = `${rawSku}-${seen}`;
        duplicateSkusReport.push({
          rowNumber: row._rowNumber,
          originalSku: rawSku,
          assignedSku: finalSku,
          grupo: row.grupo,
          nombre: row.nombre,
          categoria: row.categoria,
          subcategoria: row.subcategoria,
          nota: row.nota || 'SKU duplicado en el catálogo',
        });
      } else if ((row.nota || '').toLowerCase().includes('repetido')) {
        duplicateSkusReport.push({
          rowNumber: row._rowNumber,
          originalSku: rawSku,
          assignedSku: finalSku,
          grupo: row.grupo,
          nombre: row.nombre,
          categoria: row.categoria,
          subcategoria: row.subcategoria,
          nota: row.nota,
        });
      }
    }

    const rawPrice = (row.precio_ars || '').trim();
    const numericPrice = rawPrice !== '' ? Number(rawPrice) : NaN;
    const hasValidPrice = Number.isFinite(numericPrice) && numericPrice > 0;
    const isRevisar = (row.estado || '').trim().toLowerCase() === 'revisar';

    if (isRevisar) {
      reviewRowsReport.push({
        rowNumber: row._rowNumber,
        grupo: row.grupo,
        nombre: row.nombre,
        categoria: row.categoria,
        subcategoria: row.subcategoria,
        sku: finalSku,
        precio_ars: hasValidPrice ? `$${numericPrice.toLocaleString('es-AR')}` : 'SIN PRECIO',
        estado: row.estado,
        nota: row.nota || 'Marcado como revisar',
      });
    }

    if (!hasValidPrice) {
      missingPriceReport.push({
        rowNumber: row._rowNumber,
        grupo: row.grupo,
        nombre: row.nombre,
        categoria: row.categoria,
        subcategoria: row.subcategoria,
        sku: finalSku,
        estado: row.estado,
        nota: row.nota || 'Precio vacío o ilegible en el catálogo',
      });
    }

    if (row.nota && !isRevisar && hasValidPrice) {
      notesReport.push({
        rowNumber: row._rowNumber,
        grupo: row.grupo,
        nombre: row.nombre,
        sku: finalSku,
        nota: row.nota,
      });
    }

    return {
      ...row,
      resolvedSku: finalSku,
      numericPrice: hasValidPrice ? numericPrice : 0,
      hasValidPrice,
      isActiveRow: !isRevisar && hasValidPrice,
    };
  });

  const groupsMap = new Map();
  for (const row of processedRows) {
    const groupKey = row.grupo.trim();
    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, []);
    }
    groupsMap.get(groupKey).push(row);
  }

  // Construir estructuras normalizadas en memoria (también usadas para snapshot JSON)
  const snapshotCategories = [];
  const parentCategoriesByKey = new Map();
  const childCategoriesByKey = new Map();
  let parentOrder = 1;
  let childOrder = 1;

  for (const row of processedRows) {
    const catName = (row.categoria || '').trim();
    const subName = (row.subcategoria || '').trim();
    if (!catName) continue;

    let parentCat = parentCategoriesByKey.get(catName.toLowerCase());
    if (!parentCat) {
      const parentSlug = slugify(catName);
      parentCat = {
        id: `cat_${parentSlug}`,
        name: catName,
        slug: parentSlug,
        parentId: null,
        order: parentOrder++,
        children: [],
      };
      parentCategoriesByKey.set(catName.toLowerCase(), parentCat);
      snapshotCategories.push(parentCat);
    }

    if (subName) {
      const subKey = `${catName.toLowerCase()}::${subName.toLowerCase()}`;
      if (!childCategoriesByKey.has(subKey)) {
        const subSlug = `${parentCat.slug}-${slugify(subName)}`;
        const subCat = {
          id: `cat_${subSlug}`,
          name: subName,
          slug: subSlug,
          parentId: parentCat.id,
          order: childOrder++,
          parent: {
            id: parentCat.id,
            name: parentCat.name,
            slug: parentCat.slug,
          },
          children: [],
        };
        childCategoriesByKey.set(subKey, subCat);
        parentCat.children.push({
          id: subCat.id,
          name: subCat.name,
          slug: subCat.slug,
          parentId: parentCat.id,
          order: subCat.order,
        });
        snapshotCategories.push(subCat);
      }
    }
  }

  const snapshotProducts = [];
  let prodIdx = 1;
  for (const [groupName, groupRows] of groupsMap.entries()) {
    const firstRow = groupRows[0];
    const catName = (firstRow.categoria || '').trim().toLowerCase();
    const subName = (firstRow.subcategoria || '').trim().toLowerCase();

    const parentCat = parentCategoriesByKey.get(catName);
    const targetCategory = subName
      ? childCategoriesByKey.get(`${catName}::${subName}`)
      : parentCat;

    const validPrices = groupRows
      .filter((r) => r.hasValidPrice)
      .map((r) => r.numericPrice);
    const basePrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

    const hasAnyRevisarOrMissingPrice = groupRows.some((r) => !r.isActiveRow);
    const productActive = !hasAnyRevisarOrMissingPrice;

    const isMultiRow = groupRows.length > 1;
    const singleRowHasVariantAttrs =
      !isMultiRow &&
      Boolean(
        firstRow.variante_tipo ||
          firstRow.variante_talle ||
          firstRow.variante_color ||
          firstRow.variante_sabor_aroma ||
          firstRow.variante_volumen_medida
      );

    const productSku = isMultiRow
      ? `GRP-${slugify(groupName).toUpperCase().slice(0, 24)}`
      : firstRow.resolvedSku;

    const productName = isMultiRow ? groupName : firstRow.nombre || groupName;
    const productDescription =
      groupRows.find((r) => r.descripcion)?.descripcion || '';
    const productId = `prod_${String(prodIdx++).padStart(4, '0')}_${slugify(productName).slice(0, 24)}`;

    const variants =
      isMultiRow || singleRowHasVariantAttrs
        ? groupRows.map((r, vIdx) => ({
            id: `var_${productId}_${vIdx + 1}`,
            productId,
            sku: r.resolvedSku,
            type: r.variante_tipo || null,
            size: r.variante_talle || null,
            color: r.variante_color || null,
            flavor: r.variante_sabor_aroma || null,
            volume: r.variante_volumen_medida || null,
            price: r.numericPrice,
            stock: 0,
            active: r.isActiveRow,
          }))
        : [];

    snapshotProducts.push({
      id: productId,
      name: productName,
      description: productDescription,
      sku: productSku,
      price: basePrice,
      transferPrice: null,
      stock: 0,
      imageUrl: null,
      badge: null,
      brand: null,
      categoryId: targetCategory?.id || null,
      active: productActive,
      soldCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: targetCategory
        ? {
            id: targetCategory.id,
            name: targetCategory.name,
            slug: targetCategory.slug,
            parentId: targetCategory.parentId,
            parent: targetCategory.parent || null,
          }
        : null,
      variants,
    });
  }

  const snapshotPath = path.resolve(__dirname, '../prisma/catalog-snapshot.json');
  fs.writeFileSync(
    snapshotPath,
    JSON.stringify({ categories: snapshotCategories, products: snapshotProducts }, null, 2),
    'utf-8'
  );

  const mdLines = [
    '# REVISAR — Observaciones del Catálogo Nocturna SexShop',
    '',
    'Este documento fue generado automáticamente por el script de importación (`npm run import:catalog`) a partir de `catalogo_nocturna.csv`.',
    '',
    '## Resumen General de Importación',
    '',
    `- **Filas totales procesadas en el CSV:** ${processedRows.length}`,
    `- **Productos únicos (agrupados por columna \`grupo\`):** ${groupsMap.size}`,
    `- **Filas con \`estado = revisar\` (cargadas como borrador / inactivas):** ${reviewRowsReport.length}`,
    `- **Filas sin precio (\`precio_ars\` vacío, cargadas como inactivas):** ${missingPriceReport.length}`,
    `- **SKUs duplicados renombrados con sufijo único:** ${duplicateSkusReport.length}`,
    `- **SKUs vacíos completados con código interno (\`NOC-XXXX\`):** ${generatedSkusReport.length}`,
    '',
    '---',
    '',
    '## 1. Filas con `estado = revisar` (Cargadas como Borrador / Inactivas)',
    '',
    '| Fila | Grupo / Producto | Variante / Nombre | Categoría | SKU Asignado | Precio | Nota del Catálogo |',
    '|------|------------------|-------------------|-----------|--------------|--------|-------------------|',
    ...reviewRowsReport.map(
      (r) =>
        `| ${r.rowNumber} | ${r.grupo} | ${r.nombre} | ${r.categoria}${
          r.subcategoria ? ` > ${r.subcategoria}` : ''
        } | \`${r.sku}\` | ${r.precio_ars} | ${r.nota} |`
    ),
    '',
    '---',
    '',
    '## 2. Filas sin Precio (`precio_ars` vacío — Cargadas como Inactivas)',
    '',
    '| Fila | Grupo / Producto | Nombre | Categoría | SKU Asignado | Estado CSV | Nota |',
    '|------|------------------|--------|-----------|--------------|------------|------|',
    ...missingPriceReport.map(
      (r) =>
        `| ${r.rowNumber} | ${r.grupo} | ${r.nombre} | ${r.categoria}${
          r.subcategoria ? ` > ${r.subcategoria}` : ''
        } | \`${r.sku}\` | ${r.estado} | ${r.nota} |`
    ),
    '',
    '---',
    '',
    '## 3. SKUs Duplicados en el Catálogo (Sufijos Aplicados)',
    '',
    'Se detectaron códigos repetidos entre distintos productos del proveedor (`144`, `138`, `153`, `109`, `C02`, además de los casos observados `407` y `D659`). Se les asignó un sufijo único para mantener la integridad de la base de datos:',
    '',
    '| Fila | SKU Original | SKU Único Asignado | Producto / Grupo | Categoría | Observación |',
    '|------|--------------|--------------------|------------------|-----------|-------------|',
    ...duplicateSkusReport.map(
      (d) =>
        `| ${d.rowNumber} | \`${d.originalSku}\` | \`${d.assignedSku}\` | ${d.nombre} | ${d.categoria}${
          d.subcategoria ? ` > ${d.subcategoria}` : ''
        } | ${d.nota} |`
    ),
    '',
    '---',
    '',
    '## 4. Productos sin SKU de Proveedor (Código Interno `NOC-XXXX` Generado)',
    '',
    '| Fila | SKU Generado | Grupo | Nombre | Categoría | Nota |',
    '|------|--------------|-------|--------|-----------|------|',
    ...generatedSkusReport.map(
      (g) =>
        `| ${g.rowNumber} | \`${g.generatedSku}\` | ${g.grupo} | ${g.nombre} | ${g.categoria}${
          g.subcategoria ? ` > ${g.subcategoria}` : ''
        } | ${g.nota || 'Sin código en el catálogo original'} |`
    ),
    '',
    '---',
    '',
    '## 5. Otras Notas e Inferencias en Filas Activas (`estado = ok`)',
    '',
    'Estas filas tienen precio y `estado = ok`, pero poseen observaciones en la columna `nota` para validar con el cliente:',
    '',
    '| Fila | Producto / Variante | SKU | Nota para confirmar con el cliente |',
    '|------|---------------------|-----|------------------------------------|',
    ...notesReport.map((n) => `| ${n.rowNumber} | ${n.nombre} | \`${n.sku}\` | ${n.nota} |`),
    '',
  ];

  const revisarPath = path.join(rootDir, 'REVISAR.md');
  fs.writeFileSync(revisarPath, mdLines.join('\n'), 'utf-8');
  console.log(`✔ Archivo REVISAR.md generado en: ${revisarPath}`);

  const prisma = new PrismaClient();
  try {
    await prisma.$connect();

    const parentCategoriesMap = new Map();
    const childCategoriesMap = new Map();
    let dbParentOrder = 1;
    let dbChildOrder = 1;

    for (const row of processedRows) {
      const catName = (row.categoria || '').trim();
      const subName = (row.subcategoria || '').trim();
      if (!catName) continue;

      let parentCat = parentCategoriesMap.get(catName.toLowerCase());
      if (!parentCat) {
        const parentSlug = slugify(catName);
        parentCat = await prisma.category.upsert({
          where: { slug: parentSlug },
          update: { name: catName },
          create: {
            name: catName,
            slug: parentSlug,
            parentId: null,
            order: dbParentOrder++,
          },
        });
        parentCategoriesMap.set(catName.toLowerCase(), parentCat);
      }

      if (subName) {
        const subKey = `${catName.toLowerCase()}::${subName.toLowerCase()}`;
        if (!childCategoriesMap.has(subKey)) {
          const subSlug = `${parentCat.slug}-${slugify(subName)}`;
          const subCat = await prisma.category.upsert({
            where: { slug: subSlug },
            update: {
              name: subName,
              parentId: parentCat.id,
            },
            create: {
              name: subName,
              slug: subSlug,
              parentId: parentCat.id,
              order: dbChildOrder++,
            },
          });
          childCategoriesMap.set(subKey, subCat);
        }
      }
    }

    let importedProductsCount = 0;
    let importedVariantsCount = 0;

    for (const [groupName, groupRows] of groupsMap.entries()) {
      const firstRow = groupRows[0];
      const catName = (firstRow.categoria || '').trim().toLowerCase();
      const subName = (firstRow.subcategoria || '').trim().toLowerCase();

      const targetCategory = subName
        ? childCategoriesMap.get(`${catName}::${subName}`)
        : parentCategoriesMap.get(catName);

      const validPrices = groupRows
        .filter((r) => r.hasValidPrice)
        .map((r) => r.numericPrice);
      const basePrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

      const hasAnyRevisarOrMissingPrice = groupRows.some((r) => !r.isActiveRow);
      const productActive = !hasAnyRevisarOrMissingPrice;

      const isMultiRow = groupRows.length > 1;
      const singleRowHasVariantAttrs =
        !isMultiRow &&
        Boolean(
          firstRow.variante_tipo ||
            firstRow.variante_talle ||
            firstRow.variante_color ||
            firstRow.variante_sabor_aroma ||
            firstRow.variante_volumen_medida
        );

      const productSku = isMultiRow
        ? `GRP-${slugify(groupName).toUpperCase().slice(0, 24)}`
        : firstRow.resolvedSku;

      const productName = isMultiRow ? groupName : firstRow.nombre || groupName;
      const productDescription =
        groupRows.find((r) => r.descripcion)?.descripcion || '';

      const existingProduct = await prisma.product.findFirst({
        where: {
          OR: [{ sku: productSku }, { name: productName }],
        },
      });

      let savedProduct;
      if (existingProduct) {
        savedProduct = await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            name: productName,
            description: productDescription,
            sku: productSku,
            price: basePrice,
            stock: 0,
            imageUrl: null,
            categoryId: targetCategory?.id || null,
            active: productActive,
          },
        });
      } else {
        savedProduct = await prisma.product.create({
          data: {
            name: productName,
            description: productDescription,
            sku: productSku,
            price: basePrice,
            stock: 0,
            imageUrl: null,
            categoryId: targetCategory?.id || null,
            active: productActive,
          },
        });
      }
      importedProductsCount++;

      if (isMultiRow || singleRowHasVariantAttrs) {
        for (const r of groupRows) {
          await prisma.productVariant.upsert({
            where: { sku: r.resolvedSku },
            update: {
              productId: savedProduct.id,
              type: r.variante_tipo || null,
              size: r.variante_talle || null,
              color: r.variante_color || null,
              flavor: r.variante_sabor_aroma || null,
              volume: r.variante_volumen_medida || null,
              price: r.numericPrice,
              stock: 0,
              active: r.isActiveRow,
            },
            create: {
              productId: savedProduct.id,
              sku: r.resolvedSku,
              type: r.variante_tipo || null,
              size: r.variante_talle || null,
              color: r.variante_color || null,
              flavor: r.variante_sabor_aroma || null,
              volume: r.variante_volumen_medida || null,
              price: r.numericPrice,
              stock: 0,
              active: r.isActiveRow,
            },
          });
          importedVariantsCount++;
        }
      }
    }

    console.log(
      `✔ Catálogo importado en base de datos: ${importedProductsCount} productos y ${importedVariantsCount} variantes.`
    );
  } catch (dbErr) {
    console.warn(
      `⚠ Nota: REVISAR.md y el snapshot de catálogo fueron generados correctamente. No se pudo conectar a PostgreSQL local (${dbErr.message.split('\n')[0]}). Cuando la base PostgreSQL esté activa, volvé a correr "npm run import:catalog".`
    );
  } finally {
    await prisma.$disconnect();
  }
}

runImport().catch((err) => {
  console.error('Error en import:catalog:', err);
  process.exit(1);
});
