import React from 'react';
import useCart from '../../hooks/useCart';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import { FiX, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const CartDrawer = ({ isOpen, onClose }) => {
  const { items } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-canvas shadow-overlay flex flex-col h-full border-l border-brand-border/20">
          {/* Header del Cajón */}
          <div className="p-5 border-b border-brand-border/20 flex items-center justify-between bg-surface">
            <div className="flex items-center space-x-2.5">
              <FiShoppingBag className="text-mauve text-lg" />
              <h2 className="font-display text-sm uppercase tracking-widest text-content">
                Tu Selección
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-content-secondary hover:text-content hover:bg-surface-elevated transition-colors"
              aria-label="Cerrar carrito"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Cuerpo del Cajón */}
          <div className="flex-1 overflow-y-auto px-5 py-3">
            {items.length === 0 ? (
              <div className="relative overflow-hidden text-center my-8 py-14 px-5 rounded-xl border border-brand-border/20 smoke-card-texture">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full border border-mauve/35 bg-canvas/70 flex items-center justify-center text-mauve">
                  <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 stroke-current" strokeWidth="1.25">
                    <path d="M12 16h24l-2 22a3 3 0 01-3 3H17a3 3 0 01-3-3l-2-22z" />
                    <path d="M18 16v-3a6 6 0 0112 0v3" />
                  </svg>
                </div>
                <h3 className="font-display text-base uppercase tracking-wider text-content mb-1">
                  Tu carrito está vacío
                </h3>
                <p className="text-content-secondary text-xs mb-6">
                  Explorá nuestra colección íntima y agregá tus favoritos.
                </p>
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-mauve hover:text-content transition-colors"
                >
                  <span>Explorar catálogo</span>
                  <FiArrowRight size={12} />
                </button>
              </div>
            ) : (
              <div className="divide-y divide-brand-border/15">
                {items.map((item) => (
                  <CartItem
                    key={item.key || `${item.product._id || item.product.id}__${item.variant?.id || 'base'}`}
                    item={item}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer del Cajón con Resumen */}
          {items.length > 0 && (
            <div className="border-t border-brand-border/20 p-5 bg-surface/60">
              <CartSummary isDrawer onCloseDrawer={onClose} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
