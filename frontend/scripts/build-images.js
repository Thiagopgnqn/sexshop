import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../..');
const sourceProductsDir = path.resolve(rootDir, 'images-source/products');
const sourceBrandDir = path.resolve(rootDir, 'images-source/brand');
const outputProductsDir = path.resolve(__dirname, '../public/images/products');
const outputBrandDir = path.resolve(__dirname, '../public/images/brand');
const manifestPath = path.resolve(__dirname, '../src/api/demo/images-manifest.json');

const VALID_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

async function processProductImages() {
  fs.mkdirSync(sourceProductsDir, { recursive: true });
  fs.mkdirSync(outputProductsDir, { recursive: true });

  const sourceFiles = fs
    .readdirSync(sourceProductsDir)
    .filter((f) => VALID_EXTENSIONS.has(path.extname(f).toLowerCase()));

  // Conjunto de nombres base (sin extensión) presentes en images-source/products
  const rawStems = new Set(sourceFiles.map((f) => path.parse(f).name.trim()));
  const expectedOutputFiles = new Set();

  // Mapa: sku -> { mainFile, galleryMap: Map<index, file> }
  const skuGroups = new Map();

  for (const file of sourceFiles) {
    const stem = path.parse(file).name.trim();
    const galleryMatch = stem.match(/^(.+)-(\d+)$/);

    // Es imagen de galería (-2, -3...) si el índice >= 2 y existe la imagen principal del SKU base
    if (galleryMatch && Number(galleryMatch[2]) >= 2 && rawStems.has(galleryMatch[1])) {
      const baseSku = galleryMatch[1];
      const galleryIdx = Number(galleryMatch[2]);
      if (!skuGroups.has(baseSku)) {
        skuGroups.set(baseSku, { mainFile: null, galleryFiles: new Map() });
      }
      skuGroups.get(baseSku).galleryFiles.set(galleryIdx, file);
    } else {
      const baseSku = stem;
      if (!skuGroups.has(baseSku)) {
        skuGroups.set(baseSku, { mainFile: null, galleryFiles: new Map() });
      }
      skuGroups.get(baseSku).mainFile = file;
    }
  }

  const productsManifest = {};
  let processedCount = 0;

  for (const [sku, group] of skuGroups.entries()) {
    if (!group.mainFile) continue;

    const srcMainPath = path.join(sourceProductsDir, group.mainFile);
    const outMainName = `${sku}.webp`;
    const outThumbName = `${sku}-thumb.webp`;
    const outMainPath = path.join(outputProductsDir, outMainName);
    const outThumbPath = path.join(outputProductsDir, outThumbName);

    await sharp(srcMainPath)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: false,
      })
      .webp({ quality: 82, effort: 4 })
      .toFile(outMainPath);

    await sharp(srcMainPath)
      .resize(400, 400, {
        fit: 'inside',
        withoutEnlargement: false,
      })
      .webp({ quality: 78, effort: 4 })
      .toFile(outThumbPath);

    expectedOutputFiles.add(outMainName);
    expectedOutputFiles.add(outThumbName);
    processedCount += 1;

    const gallery = [
      {
        main: `/images/products/${outMainName}`,
        thumb: `/images/products/${outThumbName}`,
      },
    ];

    const sortedIndices = Array.from(group.galleryFiles.keys()).sort((a, b) => a - b);
    for (const idx of sortedIndices) {
      const gFile = group.galleryFiles.get(idx);
      const srcGPath = path.join(sourceProductsDir, gFile);
      const gMainName = `${sku}-${idx}.webp`;
      const gThumbName = `${sku}-${idx}-thumb.webp`;
      const gMainPath = path.join(outputProductsDir, gMainName);
      const gThumbPath = path.join(outputProductsDir, gThumbName);

      await sharp(srcGPath)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: false,
        })
        .webp({ quality: 82, effort: 4 })
        .toFile(gMainPath);

      await sharp(srcGPath)
        .resize(400, 400, {
          fit: 'inside',
          withoutEnlargement: false,
        })
        .webp({ quality: 78, effort: 4 })
        .toFile(gThumbPath);

      expectedOutputFiles.add(gMainName);
      expectedOutputFiles.add(gThumbName);
      processedCount += 1;

      gallery.push({
        main: `/images/products/${gMainName}`,
        thumb: `/images/products/${gThumbName}`,
      });
    }

    productsManifest[sku] = {
      main: `/images/products/${outMainName}`,
      thumb: `/images/products/${outThumbName}`,
      gallery,
    };
  }

  // Limpiar archivos huérfanos en frontend/public/images/products/ que ya no estén en images-source/products/
  const existingOutputs = fs.readdirSync(outputProductsDir);
  for (const file of existingOutputs) {
    if (file === '.gitkeep') continue;
    if (!expectedOutputFiles.has(file)) {
      fs.unlinkSync(path.join(outputProductsDir, file));
    }
  }

  return { productsManifest, processedCount, skuCount: Object.keys(productsManifest).length };
}

async function processBrandImages() {
  fs.mkdirSync(sourceBrandDir, { recursive: true });
  fs.mkdirSync(outputBrandDir, { recursive: true });

  const brandSourceFiles = fs
    .readdirSync(sourceBrandDir)
    .filter((f) => VALID_EXTENSIONS.has(path.extname(f).toLowerCase()));

  for (const file of brandSourceFiles) {
    const stem = path.parse(file).name.trim().toLowerCase();
    const srcPath = path.join(sourceBrandDir, file);
    if (stem === 'about') {
      await sharp(srcPath)
        .resize(1200, 900, { fit: 'cover' })
        .webp({ quality: 82 })
        .toFile(path.join(outputBrandDir, 'about.webp'));
    }
  }

  const hasHero = fs.existsSync(path.join(outputBrandDir, 'hero.webp'));
  const hasHeroMobile = fs.existsSync(path.join(outputBrandDir, 'hero-mobile.webp'));
  const hasAbout = fs.existsSync(path.join(outputBrandDir, 'about.webp'));
  const hasOg = fs.existsSync(path.join(outputBrandDir, 'og-image.png'));

  return {
    hero: hasHero ? '/images/brand/hero.webp' : null,
    heroMobile: hasHeroMobile ? '/images/brand/hero-mobile.webp' : null,
    about: hasAbout ? '/images/brand/about.webp' : null,
    ogImage: hasOg ? '/images/brand/og-image.png' : '/og-image.png',
  };
}

async function run() {
  const { productsManifest, processedCount, skuCount } = await processProductImages();
  const brandManifest = await processBrandImages();

  const manifest = {
    generatedAt: new Date().toISOString(),
    brand: brandManifest,
    products: productsManifest,
  };

  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(
    `[images:build] Completado: ${skuCount} SKUs con imagen (${processedCount} archivos procesados). Manifiesto actualizado en ${manifestPath}`
  );
}

run().catch((err) => {
  console.error('[images:build] Error:', err);
  process.exit(1);
});
