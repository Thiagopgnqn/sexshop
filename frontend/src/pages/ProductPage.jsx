import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import useCart from '../hooks/useCart';
import useSEO from '../hooks/useSEO';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import ProductPlaceholder from '../components/ui/ProductPlaceholder';
import ProductCard from '../components/catalog/ProductCard';
import { trackViewContent } from '../utils/metaPixel';
import { formatVariantDescription } from '../context/CartContext';
import { resolveProductImage } from '../utils/productImages';
import {
  FiArrowLeft,
  FiShield,
  FiTruck,
  FiShoppingBag,
  FiChevronDown,
  FiChevronUp,
  FiMinus,
  FiPlus,
  FiMessageCircle,
  FiTag,
  FiPackage,
  FiCheck,
} from 'react-icons/fi';
import themeConfig from '../config/theme';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openTab, setOpenTab] = useState('shipping');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [comboAdded, setComboAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await client.get(`/products/${id}`);
        setProduct(res.data);
        const activeVars = (res.data.variants || []).filter((v) => v.active !== false);
        if (activeVars.length > 0) {
          const inStockVar = activeVars.find((v) => Number(v.stock) > 0) || activeVars[0];
          setSelectedVariantId(inStockVar.id);
        } else {
          setSelectedVariantId(null);
        }

        // Cargar productos relacionados ("Combina con")
        const catId = res.data.categoryId || res.data.category?.id;
        if (catId) {
          client
            .get(`/products?category=${catId}&limit=4`)
            .then((relRes) => {
              const list = (relRes.data?.products || []).filter((p) => p.id !== res.data.id);
              setRelatedProducts(list.slice(0, 3));
            })
            .catch(() => {});
        }
      } catch (err) {
        setError('Artículo no encontrado');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const activeVariants = useMemo(
    () => (product?.variants || []).filter((v) => v.active !== false),
    [product]
  );

  const selectedVariant = useMemo(
    () => activeVariants.find((v) => v.id === selectedVariantId) || null,
    [activeVariants, selectedVariantId]
  );

  // Cotización dinámica según variante seleccionada
  const activePricing = selectedVariant?.pricing || product?.pricing || null;
  const activePrice =
    activePricing?.finalPrice != null
      ? Number(activePricing.finalPrice)
      : selectedVariant?.price != null
      ? Number(selectedVariant.price)
      : Number(product?.price || 0);

  const activeCompareAtPrice =
    activePricing?.compareAtPrice != null ? Number(activePricing.compareAtPrice) : null;

  const activeSavings =
    activePricing?.savingsAmount != null ? Number(activePricing.savingsAmount) : 0;

  const activeDiscountPercent =
    activePricing?.discountPercent != null ? Number(activePricing.discountPercent) : 0;

  const activePromoLabel = activePricing?.promotionLabel || null;

  const activeStock = selectedVariant
    ? Number(selectedVariant.stock ?? 0)
    : Number(product?.stock ?? 0);
  const activeSku = selectedVariant?.sku || product?.sku;

  const transferPrice = product?.transferPrice
    ? Number(product.transferPrice)
    : Math.round(activePrice * 0.9);

  // Meta Pixel ViewContent — estrictamente ID/SKU y valor, NUNCA content_name ni categoría
  useEffect(() => {
    if (product) {
      trackViewContent({
        id: activeSku || product.id,
        price: activePrice,
      });
    }
  }, [product?.id]);

  useEffect(() => {
    setQuantity(1);
    setActiveGalleryIdx(0);
    setImgError(false);
  }, [selectedVariantId, product?.id]);

  const resolvedImg = useMemo(
    () => resolveProductImage(product, selectedVariant),
    [product, selectedVariant]
  );
  const gallery = resolvedImg?.gallery || [];
  const currentGalleryItem = gallery[activeGalleryIdx] || gallery[0] || null;
  const imageUrl = currentGalleryItem?.main || resolvedImg?.main || null;
  const priceFormatted = activePrice.toLocaleString('es-AR');
  const categoryLabel = product?.category?.parent?.name
    ? `${product.category.parent.name} · ${product.category.name}`
    : product?.category?.name;

  useSEO(
    product
      ? {
          title: `${product.name}${product.category?.name ? ` — ${product.category.name}` : ''}`,
          description: product.description
            ? product.description.slice(0, 155)
            : `${product.name} disponible en ${themeConfig.brand.name}. Envíos 100% discretos en Córdoba.`,
          image: imageUrl,
          type: 'product',
          structuredData: {
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: product.name,
            sku: activeSku || undefined,
            image: imageUrl ? [imageUrl] : [],
            description:
              product.description || `${product.name} en ${themeConfig.brand.name}.`,
            brand: {
              '@type': 'Brand',
              name: product.brand || themeConfig.brand.name,
            },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'ARS',
              price: activePrice,
              availability:
                activeStock > 0
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
              seller: {
                '@type': 'Organization',
                name: themeConfig.brand.name,
              },
            },
          },
        }
      : {}
  );

  if (loading) {
    return (
      <div className="py-32 flex justify-center bg-canvas">
        <Spinner size="lg" text="Cargando producto..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-24 text-center px-4 bg-canvas max-w-md mx-auto">
        <FiShoppingBag className="mx-auto text-4xl text-mauve/40 mb-3" />
        <h2 className="font-display text-xl uppercase tracking-widest text-content mb-2">
          {error || 'Artículo no disponible'}
        </h2>
        <p className="text-content-secondary text-xs mb-6">
          El producto que buscás no existe o no se encuentra activo en este momento.
        </p>
        <Link to="/catalogo">
          <Button variant="primary">Volver al catálogo</Button>
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    if (activeStock > 0) {
      addToCart(product, quantity, selectedVariant);
    }
  };

  const whatsappConsultUrl = `https://wa.me/${themeConfig.contact.whatsapp}?text=${encodeURIComponent(
    `Hola Nocturna! Quería consultar disponibilidad de: ${product.name}${
      selectedVariant ? ` (${formatVariantDescription(selectedVariant)})` : ''
    }${activeSku ? ` [SKU ${activeSku}]` : ''}`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Enlace para volver */}
      <Link
        to="/catalogo"
        className="inline-flex items-center text-xs font-medium text-content-secondary hover:text-content mb-8 transition-colors"
      >
        <FiArrowLeft className="mr-1.5" />
        <span>Volver al catálogo</span>
      </Link>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        {/* Columna Izquierda: Imagen Principal y Galería */}
        <div className="lg:col-span-6 mb-10 lg:mb-0">
          <div className="aspect-square w-full rounded-lg overflow-hidden bg-surface border border-brand-border/20 flex items-center justify-center relative">
            {imageUrl && !imgError ? (
              <img
                src={imageUrl}
                srcSet={currentGalleryItem?.srcSet || resolvedImg?.srcSet}
                sizes="(max-width: 1024px) 100vw, 50vw"
                width="800"
                height="800"
                alt={`${product.name}${
                  selectedVariant ? ` — ${formatVariantDescription(selectedVariant)}` : ''
                }`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                onError={() => setImgError(true)}
              />
            ) : (
              <ProductPlaceholder size="lg" label={product.category?.name || 'Nocturna'} />
            )}

            {product.badge && (
              <div className="absolute top-4 left-4">
                <Badge variant="brand">{product.badge}</Badge>
              </div>
            )}
          </div>

          {/* Miniaturas de galería cuando existen {SKU}-2, {SKU}-3... */}
          {gallery.length > 1 && !imgError && (
            <div className="mt-3 flex items-center gap-2.5 overflow-x-auto pb-1">
              {gallery.map((gItem, idx) => {
                const isCurrent = idx === activeGalleryIdx;
                return (
                  <button
                    key={gItem.main || idx}
                    type="button"
                    onClick={() => {
                      setActiveGalleryIdx(idx);
                      setImgError(false);
                    }}
                    className={`w-16 h-16 rounded-md overflow-hidden border flex-shrink-0 transition-all ${
                      isCurrent
                        ? 'border-mauve ring-1 ring-mauve opacity-100'
                        : 'border-brand-border/25 opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`Ver imagen ${idx + 1} de ${product.name}`}
                  >
                    <img
                      src={gItem.thumb || gItem.main}
                      width="80"
                      height="80"
                      loading="lazy"
                      decoding="async"
                      alt={`${product.name} vista ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Garantías de privacidad debajo de la imagen */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-content-secondary">
            <div className="flex items-center gap-2.5 p-3.5 rounded-md bg-surface border border-brand-border/20">
              <FiShield className="text-mauve text-sm flex-shrink-0" />
              <span>Empaque 100% neutro sin logos ni marcas</span>
            </div>
            <div className="flex items-center gap-2.5 p-3.5 rounded-md bg-surface border border-brand-border/20">
              <FiTruck className="text-mauve text-sm flex-shrink-0" />
              <span>Envíos discretos en Córdoba</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Ficha de Compra e Información */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="bg-surface p-6 sm:p-8 rounded-lg border border-brand-border/20">
            <div className="flex items-center justify-between gap-2 mb-2">
              {categoryLabel && (
                <p className="text-[11px] font-medium uppercase tracking-widest text-mauve">
                  {categoryLabel}
                </p>
              )}
              {activeSku && (
                <span className="text-[10px] text-content-muted font-mono">
                  SKU: {activeSku}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-light uppercase tracking-wider text-content mb-3 leading-snug">
              {product.name}
            </h1>

            {/* Precio, Disponibilidad y Ahorro */}
            <div className="py-4 my-3 border-y border-brand-border/15">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <div className="flex items-baseline flex-wrap gap-x-3">
                  <span className="text-2xl sm:text-3xl font-bold text-content tracking-tight">
                    {themeConfig.brand.currencySymbol}{priceFormatted}
                  </span>

                  {/* REGLA LEGAL: Solo mostrar precio tachado si compareAtPrice fue verificado en PriceHistory */}
                  {activeCompareAtPrice != null && activeCompareAtPrice > activePrice && (
                    <span className="text-base sm:text-lg text-content-muted line-through">
                      {themeConfig.brand.currencySymbol}
                      {activeCompareAtPrice.toLocaleString('es-AR')}
                    </span>
                  )}

                  {activeDiscountPercent > 0 && (
                    <Badge variant="brand">{activeDiscountPercent}% OFF</Badge>
                  )}
                </div>

                <div>
                  {activeStock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-1 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Disponible ({activeStock} un.)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-medium text-content-secondary bg-surface-elevated border border-brand-border/30 px-2.5 py-1 rounded">
                      Sin stock inmediato
                    </span>
                  )}
                </div>
              </div>

              {/* Ahorro comprobado */}
              {activeCompareAtPrice != null && activeSavings > 0 && (
                <p className="text-xs text-emerald-400 font-medium mt-1.5">
                  Ahorrás {themeConfig.brand.currencySymbol}{activeSavings.toLocaleString('es-AR')}
                  {activePromoLabel && (
                    <span className="text-content-muted font-normal ml-1">({activePromoLabel})</span>
                  )}
                </p>
              )}

              {/* Promo activa sin precio anterior comprobado (honesta) */}
              {activeCompareAtPrice == null && activePromoLabel && (
                <p className="text-xs text-mauve font-medium mt-1.5">
                  Promoción vigente: {activePromoLabel}
                </p>
              )}
            </div>

            {/* Precio por transferencia */}
            <div className="mb-6 p-3.5 rounded-md bg-surface-elevated/70 border border-brand-border/25 flex items-center justify-between text-xs">
              <div>
                <p className="font-medium text-content">Precio con transferencia (10% OFF):</p>
                <p className="text-content-muted">Bonificación directa coordinando por WhatsApp</p>
              </div>
              <span className="text-base font-semibold text-emerald-300">
                {themeConfig.brand.currencySymbol}
                {transferPrice.toLocaleString('es-AR')}
              </span>
            </div>

            {/* Selector de Variantes (Tipo, Talle, Color, Sabor/Aroma, Volumen) */}
            {activeVariants.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-widest text-content-secondary mb-2.5">
                  Seleccioná una opción ({activeVariants.length}):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeVariants.map((variant) => {
                    const isSelected = variant.id === selectedVariantId;
                    const label =
                      formatVariantDescription(variant) || `Opción ${variant.sku}`;
                    const varFinalPrice =
                      variant.pricing?.finalPrice != null
                        ? Number(variant.pricing.finalPrice)
                        : Number(variant.price || product.price);
                    const varPriceFormatted = varFinalPrice.toLocaleString('es-AR');
                    const varDiscount = variant.pricing?.discountPercent || 0;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`p-3 rounded-md border text-left transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-brand/40 border-mauve text-content shadow-soft'
                            : 'bg-canvas border-brand-border/25 text-content-secondary hover:border-mauve/50 hover:text-content'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{label}</p>
                          <p className="text-[10px] text-content-muted mt-0.5">
                            {Number(variant.stock) > 0
                              ? `${variant.stock} en stock`
                              : 'Consultar stock'}
                          </p>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <span className="text-xs font-semibold text-content block">
                            {themeConfig.brand.currencySymbol}{varPriceFormatted}
                          </span>
                          {varDiscount > 0 && (
                            <span className="text-[10px] text-mauve font-medium">
                              {varDiscount}% OFF
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Condiciones de la Promoción Visible */}
            {product.activePromotions && product.activePromotions.length > 0 && (
              <div className="mb-6 p-4 rounded-lg bg-canvas border border-brand-border/30 space-y-2">
                <div className="flex items-center gap-2 text-mauve">
                  <FiTag className="text-sm" />
                  <h4 className="text-xs font-display uppercase tracking-wider text-content">
                    Condiciones de Promociones Aplicables
                  </h4>
                </div>
                <div className="space-y-2 text-xs">
                  {product.activePromotions.map((promo) => (
                    <div
                      key={promo.id}
                      className="border-l-2 border-mauve pl-3 py-1 bg-surface/50 rounded-r"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-content">{promo.name}</span>
                        {promo.badgeLabel && (
                          <Badge variant="brand">{promo.badgeLabel}</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-content-muted mt-0.5">
                        • {promo.conditions?.stockNotice || 'Hasta agotar stock disponible'}
                        {promo.conditions?.minQuantity &&
                          ` • Mínimo ${promo.conditions.minQuantity} un.`}
                        {promo.conditions?.maxDiscountAmount &&
                          ` • Reintegro máx. $${Number(promo.conditions.maxDiscountAmount).toLocaleString('es-AR')}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Descripción */}
            {product.description && (
              <div className="text-content-secondary text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                <p>{product.description}</p>
              </div>
            )}

            {/* Selector de cantidad y CTA */}
            <div className="space-y-3 pt-4 border-t border-brand-border/15">
              {activeStock > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center border border-brand-border/30 rounded-md bg-canvas">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2.5 text-content-secondary hover:text-content hover:bg-surface-elevated transition-colors"
                      aria-label="Disminuir cantidad"
                    >
                      <FiMinus size={13} />
                    </button>
                    <span className="px-4 text-xs font-semibold text-content select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
                      disabled={quantity >= activeStock}
                      className="p-2.5 text-content-secondary hover:text-content hover:bg-surface-elevated disabled:opacity-30 transition-colors"
                      aria-label="Aumentar cantidad"
                    >
                      <FiPlus size={13} />
                    </button>
                  </div>

                  <div className="flex-1">
                    <Button
                      fullWidth
                      size="lg"
                      onClick={handleAdd}
                      className="text-xs sm:text-sm"
                    >
                      <FiShoppingBag className="mr-2" />
                      <span>Agregar al carrito</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <a
                  href={whatsappConsultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button fullWidth variant="outline" size="lg" className="text-xs sm:text-sm">
                    <FiMessageCircle className="mr-2 text-mauve" />
                    <span>Consultar ingreso por WhatsApp</span>
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Acordeón de Envío Discreto y Política de Cambios */}
          <div className="mt-6 border border-brand-border/20 rounded-lg overflow-hidden bg-surface divide-y divide-brand-border/15">
            <div>
              <button
                type="button"
                onClick={() => setOpenTab(openTab === 'shipping' ? '' : 'shipping')}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left text-xs font-display uppercase tracking-widest text-content hover:bg-surface-elevated/50 transition-colors"
              >
                <span>Envío y Empaque 100% Discreto</span>
                {openTab === 'shipping' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </button>
              {openTab === 'shipping' && (
                <div className="px-5 pb-4 text-xs text-content-secondary leading-relaxed space-y-1.5">
                  <p>• {themeConfig.legal.discreetNotice}</p>
                  <p>• Sin mínimo de compra. Coordinamos entrega por cadetería en Córdoba ({themeConfig.contact.deliveryZone}) o retiro acordado por WhatsApp.</p>
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setOpenTab(openTab === 'returns' ? '' : 'returns')}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left text-xs font-display uppercase tracking-widest text-content hover:bg-surface-elevated/50 transition-colors"
              >
                <span>Política de Cambios y Garantía</span>
                {openTab === 'returns' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </button>
              {openTab === 'returns' && (
                <div className="px-5 pb-4 text-xs text-content-secondary leading-relaxed space-y-1.5">
                  <p>• {themeConfig.legal.returnsPolicyNotice}</p>
                  <p>• Todos los dispositivos electrónicos se verifican antes de su entrega. Ante cualquier duda sobre uso o cuidado, escribinos por WhatsApp.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bloque Comprá Junto y Ahorrá (Combos) */}
      {product.comboPromotions && product.comboPromotions.length > 0 && (
        <div className="mt-14 p-6 sm:p-8 rounded-xl bg-surface border border-mauve/40 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="brand">Combo Especial</Badge>
            <h3 className="font-display text-base sm:text-lg uppercase tracking-wider text-content">
              Comprá junto y ahorrá
            </h3>
          </div>

          {product.comboPromotions.map((combo) => (
            <div key={combo.id} className="space-y-4">
              <p className="text-xs text-content-secondary leading-relaxed">
                Aprovechá la promoción <strong className="text-content">{combo.name}</strong> llevando los productos sugeridos en un solo combo con descuento directo.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {combo.items?.map((cItem) => (
                  <div
                    key={cItem.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-canvas border border-brand-border/20"
                  >
                    <div className="w-14 h-14 rounded bg-surface overflow-hidden flex-shrink-0">
                      <img
                        src={cItem.imageUrl || '/brand/instagram-profile.jpg'}
                        alt={cItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-content truncate">{cItem.name}</p>
                      <p className="text-[11px] text-content-muted">
                        {themeConfig.brand.currencySymbol}
                        {Number(cItem.price || 0).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-brand-border/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-content-muted line-through">
                      {themeConfig.brand.currencySymbol}
                      {combo.regularTotal.toLocaleString('es-AR')}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-content">
                      {themeConfig.brand.currencySymbol}
                      {combo.bundlePrice.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400 font-medium">
                    ¡Ahorrás {themeConfig.brand.currencySymbol}
                    {combo.savings.toLocaleString('es-AR')} llevando el combo!
                  </p>
                </div>

                <Button
                  variant="primary"
                  onClick={() => {
                    (combo.items || []).forEach((cItem) => addToCart(cItem, 1));
                    setComboAdded(true);
                    setTimeout(() => setComboAdded(false), 3000);
                  }}
                  className="text-xs sm:text-sm"
                >
                  {comboAdded ? (
                    <>
                      <FiCheck className="mr-1.5" />
                      <span>¡Combo Agregado!</span>
                    </>
                  ) : (
                    <>
                      <FiShoppingBag className="mr-1.5" />
                      <span>Agregar Combo al Carrito</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bloque Combina con (Productos Relacionados) */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t border-brand-border/20">
          <div className="mb-6">
            <span className="text-[11px] uppercase tracking-widest text-mauve font-medium">
              Recomendaciones Privadas
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-light uppercase tracking-wider text-content mt-1">
              Combina con
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relProd) => (
              <ProductCard key={relProd.id} product={relProd} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
