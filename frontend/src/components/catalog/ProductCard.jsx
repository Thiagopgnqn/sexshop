import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ProductPlaceholder from '../ui/ProductPlaceholder';
import useCart from '../../hooks/useCart';
import { resolveProductImage } from '../../utils/productImages';
import { FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import themeConfig from '../../config/theme';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const productId = product.id || product._id;
  const resolvedImg = resolveProductImage(product);
  const imageUrl = resolvedImg?.main || null;
  const activeVariants = Array.isArray(product.variants)
    ? product.variants.filter((v) => v.active !== false)
    : [];
  const hasVariants = activeVariants.length > 0;

  const totalStock = hasVariants
    ? activeVariants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
    : Number(product.stock || 0);
  const isOutOfStock = totalStock <= 0;

  // Precios con motor de precios centralizado
  const pricing = product.pricing || null;
  const finalPrice = pricing?.finalPrice != null ? Number(pricing.finalPrice) : Number(product.price || 0);
  const priceFormatted = finalPrice.toLocaleString('es-AR');
  const compareAtPrice = pricing?.compareAtPrice != null ? Number(pricing.compareAtPrice) : null;
  const savingsAmount = pricing?.savingsAmount != null ? Number(pricing.savingsAmount) : 0;
  const discountPercent = pricing?.discountPercent != null ? Number(pricing.discountPercent) : 0;
  const promoLabel = pricing?.promotionLabel || null;

  // Precio por transferencia (10% OFF si no viene fijado)
  const transferPrice = product.transferPrice
    ? Number(product.transferPrice)
    : Math.round(finalPrice * 0.9);

  // Badges
  const isNew = Boolean(product.isNew);
  const isBestSeller = Boolean(product.isBestSeller);
  const isLowStock = totalStock > 0 && totalStock <= 3;

  const categoryName =
    product.category?.parent?.name
      ? `${product.category.parent.name} · ${product.category.name}`
      : product.category?.name;

  const handleAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasVariants) {
      navigate(`/producto/${productId}`);
      return;
    }
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  return (
    <div className="group bg-surface rounded-lg border border-brand-border/20 overflow-hidden transition-smooth hover:border-mauve/50 flex flex-col h-full relative">
      <Link to={`/producto/${productId}`} className="relative flex-grow flex flex-col">
        {/* Contenedor de Imagen 1:1 */}
        <div className="aspect-square w-full bg-canvas relative overflow-hidden flex items-center justify-center border-b border-brand-border/15">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              srcSet={resolvedImg?.srcSet}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              width="400"
              height="400"
              alt={`${product.name} — ${product.category?.name || themeConfig.brand.name}`}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
              onError={() => setImgError(true)}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <ProductPlaceholder label={product.category?.name || 'Nocturna'} />
          )}

          {/* Badges de promoción y catálogo */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5 max-w-[85%]">
            {discountPercent > 0 && (
              <Badge variant="brand">{discountPercent}% OFF</Badge>
            )}
            {!discountPercent && product.activePromotions?.some((p) => p.kind === 'BUY_X_PAY_Y') && (
              <Badge variant="brand">2x1</Badge>
            )}
            {!discountPercent && product.activePromotions?.some((p) => p.kind === 'BUNDLE_PRICE') && (
              <Badge variant="brand">Combo</Badge>
            )}
            {isNew && !discountPercent && (
              <Badge variant="neutral">Nuevo</Badge>
            )}
            {isBestSeller && (
              <Badge variant="neutral">Más vendido</Badge>
            )}
            {product.badge && !discountPercent && product.badge !== 'Nuevo' && product.badge !== 'Más vendido' && (
              <Badge variant="brand">{product.badge}</Badge>
            )}
            {hasVariants && (
              <Badge variant="neutral">{activeVariants.length} opciones</Badge>
            )}
          </div>

          {/* Sin stock */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-canvas/75 backdrop-blur-[1px] flex items-center justify-center z-20">
              <span className="bg-surface-elevated text-content-secondary border border-brand-border/30 px-3 py-1 rounded text-[10px] font-medium uppercase tracking-widest">
                Sin Stock
              </span>
            </div>
          )}
        </div>

        {/* Ficha descriptiva */}
        <div className="p-4 sm:p-5 flex flex-col flex-grow">
          {categoryName && (
            <div className="text-[10px] font-medium text-mauve uppercase tracking-widest mb-1.5 truncate">
              {categoryName}
            </div>
          )}

          <h3 className="font-medium text-sm sm:text-base text-content mb-1.5 leading-snug line-clamp-2 group-hover:text-mauve-light transition-colors">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-content-muted line-clamp-2 mb-3 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Precios y Ahorro */}
          <div className="mt-auto pt-3 border-t border-brand-border/15">
            <div className="flex items-baseline justify-between gap-1 flex-wrap">
              <div className="flex items-baseline flex-wrap gap-x-2">
                {hasVariants && (
                  <span className="text-[10px] uppercase tracking-wider text-content-muted">
                    Desde
                  </span>
                )}
                <span className="text-base sm:text-lg font-bold text-content tracking-tight">
                  {themeConfig.brand.currencySymbol}{priceFormatted}
                </span>

                {/* REGLA LEGAL: Solo mostrar precio tachado si compareAtPrice fue verificado por PriceHistory */}
                {compareAtPrice != null && compareAtPrice > finalPrice && (
                  <span className="text-xs text-content-muted line-through">
                    {themeConfig.brand.currencySymbol}{compareAtPrice.toLocaleString('es-AR')}
                  </span>
                )}
              </div>

              {isLowStock && (
                <span className="text-[10px] font-medium text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40 whitespace-nowrap">
                  Últimas {totalStock} un.
                </span>
              )}
            </div>

            {/* Ahorro comprobado */}
            {compareAtPrice != null && savingsAmount > 0 && (
              <div className="text-[11px] font-medium text-emerald-400 mt-1">
                Ahorrás {themeConfig.brand.currencySymbol}{savingsAmount.toLocaleString('es-AR')}
                {promoLabel && (
                  <span className="text-content-muted font-normal ml-1">({promoLabel})</span>
                )}
              </div>
            )}

            {/* Si no tiene compareAtPrice validado pero tiene promo activa, solo mostrar la etiqueta */}
            {compareAtPrice == null && promoLabel && (
              <div className="text-[11px] font-medium text-mauve mt-1">
                Promoción: {promoLabel}
              </div>
            )}

            {/* Transferencia */}
            <p className="text-[11px] text-emerald-300 font-medium mt-1">
              <span>
                {themeConfig.brand.currencySymbol}
                {transferPrice.toLocaleString('es-AR')}
              </span>
              <span className="text-content-muted font-normal ml-1">con transferencia (10% OFF)</span>
            </p>
          </div>
        </div>
      </Link>

      {/* Botón de acción rápida */}
      <div className="p-4 sm:p-5 pt-0">
        {hasVariants ? (
          <Button
            fullWidth
            variant="outline"
            onClick={handleAction}
            className="py-2 text-xs font-medium"
          >
            <span className="inline-flex items-center gap-2">
              <span>Ver opciones</span>
              <FiArrowRight className="text-xs" />
            </span>
          </Button>
        ) : (
          <Button
            fullWidth
            variant={isOutOfStock ? 'secondary' : 'primary'}
            disabled={isOutOfStock}
            onClick={handleAction}
            className="py-2 text-xs font-medium"
          >
            {isOutOfStock ? (
              'Sin stock'
            ) : (
              <span className="inline-flex items-center gap-2">
                <FiShoppingBag className="text-xs" />
                <span>Agregar al carrito</span>
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
