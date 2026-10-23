import React from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import useCart from '../../hooks/useCart';
import themeConfig from '../../config/theme';
import ProductPlaceholder from '../ui/ProductPlaceholder';
import { formatVariantDescription } from '../../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, variant, quantity } = item;

  const productId = product._id || product.id;
  const variantId = variant?.id || null;
  const maxStock = variant ? Number(variant.stock ?? 0) : Number(product.stock ?? 0);
  const unitPrice = variant?.price != null ? Number(variant.price) : Number(product.price || 0);
  const variantLabel = item.variantDescription || formatVariantDescription(variant);

  const handleDecrease = () => {
    if (quantity > 1) {
      updateQuantity(productId, quantity - 1, variantId);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxStock) {
      updateQuantity(productId, quantity + 1, variantId);
    }
  };

  const unitTotal = (unitPrice * quantity).toLocaleString('es-AR');

  return (
    <div className="flex py-5 gap-4 border-b border-brand-border/15 items-center">
      {/* Thumbnail de producto */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded border border-brand-border/20 bg-canvas flex items-center justify-center">
        {(product.imageUrl || product.image) ? (
          <img
            src={product.imageUrl || product.image}
            alt={product.name}
            className="h-full w-full object-cover object-center"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <ProductPlaceholder size="sm" showLabel={false} />
        )}
      </div>

      {/* Info y Controles */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <div>
              {product.category?.name && (
                <p className="text-[10px] font-medium uppercase tracking-widest text-mauve mb-0.5">
                  {product.category.name}
                </p>
              )}
              <h3 className="font-medium text-sm text-content line-clamp-1">
                <Link to={`/producto/${productId}`} className="hover:text-mauve transition-colors">
                  {product.name}
                </Link>
              </h3>
              {variantLabel && (
                <p className="text-xs text-content-secondary mt-0.5">
                  {variantLabel}
                </p>
              )}
            </div>

            <p className="font-semibold text-content text-sm whitespace-nowrap ml-2">
              {themeConfig.brand.currencySymbol}{unitTotal}
            </p>
          </div>
        </div>

        {/* Stepper y botón eliminar */}
        <div className="flex items-center justify-between mt-3">
          <div className="inline-flex items-center border border-brand-border/30 rounded bg-canvas">
            <button
              onClick={handleDecrease}
              className="p-1.5 text-content-secondary hover:text-content hover:bg-surface-elevated transition-colors"
              title="Disminuir una unidad"
              aria-label="Disminuir una unidad"
            >
              <FiMinus size={11} />
            </button>
            <span className="px-3 text-xs font-medium text-content select-none">
              {quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={quantity >= maxStock}
              className="p-1.5 text-content-secondary hover:text-content hover:bg-surface-elevated disabled:opacity-30 transition-colors"
              title="Aumentar una unidad"
              aria-label="Aumentar una unidad"
            >
              <FiPlus size={11} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeFromCart(productId, variantId)}
            className="text-xs text-content-muted hover:text-rose-400 flex items-center gap-1 transition-colors p-1"
            title="Quitar del carrito"
          >
            <FiTrash2 size={13} />
            <span className="hidden sm:inline">Quitar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
