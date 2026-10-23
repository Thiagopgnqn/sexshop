import imagesManifest from '../api/demo/images-manifest.json';
import { isDemoMode } from '../api/demo/demoAdapter';

const manifestProducts = imagesManifest?.products || {};
const manifestBrand = imagesManifest?.brand || {};

const findManifestEntryBySku = (rawSku) => {
  if (!rawSku) return null;
  const clean = String(rawSku).trim();
  if (!clean) return null;

  if (manifestProducts[clean]) {
    return { entry: manifestProducts[clean], sku: clean };
  }

  const withoutGrp = clean.replace(/-GRP$/i, '');
  if (withoutGrp !== clean && manifestProducts[withoutGrp]) {
    return { entry: manifestProducts[withoutGrp], sku: withoutGrp };
  }

  // Búsqueda case-insensitive por seguridad
  const lower = clean.toLowerCase();
  const lowerWithoutGrp = withoutGrp.toLowerCase();
  for (const [key, val] of Object.entries(manifestProducts)) {
    const kLower = key.toLowerCase();
    if (kLower === lower || kLower === lowerWithoutGrp) {
      return { entry: val, sku: key };
    }
  }

  return null;
};

const formatManifestResult = ({ entry, sku }) => {
  const gallery =
    Array.isArray(entry.gallery) && entry.gallery.length > 0
      ? entry.gallery.map((g) => ({
          main: g.main,
          thumb: g.thumb || g.main,
          srcSet: g.thumb ? `${g.thumb} 400w, ${g.main} 800w` : undefined,
        }))
      : [
          {
            main: entry.main,
            thumb: entry.thumb || entry.main,
            srcSet: entry.thumb ? `${entry.thumb} 400w, ${entry.main} 800w` : undefined,
          },
        ];

  return {
    main: entry.main,
    thumb: entry.thumb || entry.main,
    srcSet: entry.thumb ? `${entry.thumb} 400w, ${entry.main} 800w` : undefined,
    gallery,
    sku,
    isStatic: true,
  };
};

const formatDirectUrlResult = (url) => ({
  main: url,
  thumb: url,
  srcSet: undefined,
  gallery: [{ main: url, thumb: url, srcSet: undefined }],
  sku: null,
  isStatic: false,
});

/**
 * Resuelve la imagen de un producto o variante siguiendo el orden de prioridad:
 * 1. En modo real: si existe imageUrl (Cloudinary), la prioriza; solo si no hay imageUrl usa el manifiesto estático.
 * 2. En modo demo: busca por SKU de la variante seleccionada -> imagen subida en Admin Demo (si existe) -> SKU del producto -> primera variante con foto en el manifiesto.
 * 3. Si no existe ninguna, devuelve null para mostrar ProductPlaceholder.
 */
export const resolveProductImage = (product, selectedVariant = null) => {
  if (!product && !selectedVariant) return null;

  const directUrl =
    selectedVariant?.imageUrl || product?.imageUrl || product?.image || null;

  // En modo real: mantener imageUrl (Cloudinary) y usar la estática solo si no hay imageUrl
  if (!isDemoMode() && directUrl) {
    return formatDirectUrlResult(directUrl);
  }

  // 1. Intentar por el SKU de la variante seleccionada
  if (selectedVariant?.sku) {
    const byVariant = findManifestEntryBySku(selectedVariant.sku);
    if (byVariant) {
      return formatManifestResult(byVariant);
    }
  }

  // En modo demo, si el usuario subió una imagen personalizada desde el panel Admin (data URL o URL)
  if (isDemoMode() && directUrl) {
    return formatDirectUrlResult(directUrl);
  }

  // 2. Intentar por el SKU del producto padre
  if (product?.sku) {
    const byProduct = findManifestEntryBySku(product.sku);
    if (byProduct) {
      return formatManifestResult(byProduct);
    }
  }

  // 3. Intentar con las variantes del producto (por ejemplo si el producto tiene variantes con SKU propio)
  if (Array.isArray(product?.variants)) {
    for (const v of product.variants) {
      if (v?.sku) {
        const byAnyVariant = findManifestEntryBySku(v.sku);
        if (byAnyVariant) {
          return formatManifestResult(byAnyVariant);
        }
      }
    }
  }

  return null;
};

export const getBrandImage = (key) => manifestBrand[key] || null;
