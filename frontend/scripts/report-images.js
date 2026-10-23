import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../..');
const demoCsvPath = path.resolve(rootDir, 'catalogo_demo.csv');
const fullCsvPath = path.resolve(rootDir, 'catalogo_nocturna.csv');
const manifestPath = path.resolve(__dirname, '../src/api/demo/images-manifest.json');
const outputProductsDir = path.resolve(__dirname, '../public/images/products');
const outputBrandDir = path.resolve(__dirname, '../public/images/brand');
const reportPath = path.resolve(rootDir, 'IMAGENES-PENDIENTES.md');

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

function formatVariantSummary(row) {
  const parts = [
    row.variante_tipo,
    row.variante_talle ? `Talle ${row.variante_talle}` : null,
    row.variante_color,
    row.variante_sabor_aroma,
    row.variante_volumen_medida,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' • ') : 'Única (Producto base)';
}

function assignNormalizedSkus(rows, autoPrefix) {
  const usedSkus = new Set();
  let autoCounter = 1;

  return rows.map((row) => {
    const raw = (row.sku || '').trim();
    let finalSku = raw;

    if (!finalSku) {
      while (true) {
        const candidate = `${autoPrefix}-${String(autoCounter++).padStart(4, '0')}`;
        if (!usedSkus.has(candidate)) {
          usedSkus.add(candidate);
          finalSku = candidate;
          break;
        }
      }
    } else if (!usedSkus.has(finalSku)) {
      usedSkus.add(finalSku);
    } else {
      let suffix = 2;
      while (usedSkus.has(`${finalSku}-${suffix}`)) {
        suffix += 1;
      }
      finalSku = `${finalSku}-${suffix}`;
      usedSkus.add(finalSku);
    }

    return {
      ...row,
      resolvedSku: finalSku,
    };
  });
}

function loadAvailableProductSkus() {
  const available = new Set();
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      Object.keys(manifest.products || {}).forEach((k) => available.add(k));
    } catch {
      // ignore
    }
  }
  if (fs.existsSync(outputProductsDir)) {
    for (const file of fs.readdirSync(outputProductsDir)) {
      if (file.endsWith('.webp') && !file.endsWith('-thumb.webp')) {
        available.add(path.parse(file).name);
      }
    }
  }
  return available;
}

function buildTableRows(rows, availableSkus) {
  // Mapear también por grupo si alguna variante del mismo grupo o el SKU base tiene foto
  const groupHasPhoto = new Map();
  for (const r of rows) {
    if (availableSkus.has(r.resolvedSku) || (r.sku && availableSkus.has(r.sku.trim()))) {
      groupHasPhoto.set(r.grupo || r.nombre, r.resolvedSku);
    }
  }

  let withPhotoCount = 0;
  const lines = rows.map((r, idx) => {
    const sku = r.resolvedSku;
    const rawSku = (r.sku || '').trim();
    const hasDirect = availableSkus.has(sku) || (rawSku && availableSkus.has(rawSku));
    const fallbackGroupSku = groupHasPhoto.get(r.grupo || r.nombre);
    const hasPhoto = hasDirect || Boolean(fallbackGroupSku);

    if (hasPhoto) withPhotoCount += 1;

    const status = hasDirect
      ? '✅ Con foto'
      : fallbackGroupSku
      ? `✅ Con foto (hereda ${fallbackGroupSku})`
      : '⏳ Sin foto';

    const expectedFile = `${sku}.jpg / .png / .webp`;
    const groupOrName = (r.grupo || r.nombre || '').replace(/\|/g, '/');
    const variantText = formatVariantSummary(r).replace(/\|/g, '/');

    return `| ${idx + 1} | \`${sku}\` | ${groupOrName} | ${variantText} | \`images-source/products/${expectedFile}\` | ${status} |`;
  });

  return { lines, withPhotoCount, totalCount: rows.length };
}

function generateReport() {
  const availableSkus = loadAvailableProductSkus();

  const demoRowsRaw = fs.existsSync(demoCsvPath)
    ? parseCsv(fs.readFileSync(demoCsvPath, 'utf-8'))
    : [];
  const fullRowsRaw = fs.existsSync(fullCsvPath)
    ? parseCsv(fs.readFileSync(fullCsvPath, 'utf-8'))
    : [];

  const demoRows = assignNormalizedSkus(demoRowsRaw, 'DEMO');
  const fullRows = assignNormalizedSkus(fullRowsRaw, 'NOC');

  const demoTable = buildTableRows(demoRows, availableSkus);
  const fullTable = buildTableRows(fullRows, availableSkus);

  const hasHero = fs.existsSync(path.join(outputBrandDir, 'hero.webp'));
  const hasHeroMobile = fs.existsSync(path.join(outputBrandDir, 'hero-mobile.webp'));
  const hasAbout = fs.existsSync(path.join(outputBrandDir, 'about.webp'));
  const hasOg = fs.existsSync(path.join(outputBrandDir, 'og-image.png'));

  const md = `# Reporte de Imágenes de Productos y Marca — Nocturna SexShop

Generado automáticamente mediante \`npm run images:report\`.

---

## Cómo Cargar Nuevas Imágenes de Productos

1. Guardá las fotos originales en la carpeta \`images-source/products/\` usando como nombre de archivo el **SKU exacto** del producto o variante que figura en las tablas de abajo:
   - Ejemplo imagen principal: \`4580.jpg\`, \`145R.png\`, \`422.webp\`
   - Ejemplo galería adicional (opcional): \`4580-2.jpg\`, \`4580-3.jpg\`
2. Ejecutá en la terminal:
   \`\`\`bash
   npm run images:build
   npm run images:report
   \`\`\`
3. El script \`images:build\` convierte cada imagen a WebP en \`frontend/public/images/products/{SKU}.webp\` (\`800 px\`) y \`{SKU}-thumb.webp\` (\`400 px\`), y actualiza \`frontend/src/api/demo/images-manifest.json\`.
4. Si un producto tiene variantes (por ejemplo distintos colores) y subís la foto de cada SKU de variante (\`145R.jpg\`, \`145N.jpg\`), la ficha de producto cambia automáticamente la foto al elegir esa variante. Si solo subís la foto de una variante o del SKU del producto, todas las demás variantes usan esa foto como respaldo. Cuando un producto no tiene foto cargada, la tienda muestra automáticamente el \`ProductPlaceholder\` de marca.

---

## 1. Imágenes de Marca (Opcionales y Principales)

| Archivo Destino | Fuente Opcional | Medidas Recomendadas | Estado Actual |
|-----------------|-----------------|----------------------|---------------|
| \`frontend/public/images/brand/hero.webp\` | *(Generada por script)* | \`1400 x 1050 px\` (4:3, WebP < 300 KB) | ${hasHero ? '✅ Con foto (Resuelta)' : '⏳ Sin foto (usa visual CSS/SVG)'} |
| \`frontend/public/images/brand/hero-mobile.webp\` | *(Generada por script)* | \`800 x 600 px\` (4:3, WebP < 150 KB) | ${hasHeroMobile ? '✅ Con foto (Resuelta)' : '⏳ Sin foto (usa visual CSS/SVG)'} |
| \`frontend/public/images/brand/about.webp\` | \`images-source/brand/about.jpg\` | \`1200 x 900 px\` (proporción 4:3, estética íntima/oscura sin rostros) | ${hasAbout ? '✅ Con foto' : '⏳ Sin foto (usa composición de marca en código)'} |
| \`frontend/public/images/brand/og-image.png\` | *(Generada por script)* | \`1200 x 630 px\` (Open Graph / Redes) | ${hasOg ? '✅ Generada (1200x630 PNG)' : '⏳ Pendiente'} |

---

## 2. Catálogo de Demostración (\`catalogo_demo.csv\`)

- **Total de filas (productos/variantes):** ${demoTable.totalCount}
- **Con foto:** ${demoTable.withPhotoCount}
- **Sin foto (usan \`ProductPlaceholder\`):** ${demoTable.totalCount - demoTable.withPhotoCount}

| # | SKU | Producto / Grupo | Variante | Archivo Esperado | Estado |
|---|-----|------------------|----------|------------------|--------|
${demoTable.lines.join('\n')}

---

## 3. Catálogo Completo (\`catalogo_nocturna.csv\`)

- **Total de filas (productos/variantes):** ${fullTable.totalCount}
- **Con foto:** ${fullTable.withPhotoCount}
- **Sin foto (usan \`ProductPlaceholder\`):** ${fullTable.totalCount - fullTable.withPhotoCount}

| # | SKU | Producto / Grupo | Variante | Archivo Esperado | Estado |
|---|-----|------------------|----------|------------------|--------|
${fullTable.lines.join('\n')}
`;

  fs.writeFileSync(reportPath, md, 'utf-8');
  console.log(
    `[images:report] Reporte generado en ${reportPath} — Demo: ${demoTable.withPhotoCount}/${demoTable.totalCount} con foto | Completo: ${fullTable.withPhotoCount}/${fullTable.totalCount} con foto.`
  );
}

generateReport();
