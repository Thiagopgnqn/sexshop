import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiX, FiShoppingBag } from 'react-icons/fi';
import themeConfig from '../../config/theme';

const Toast = ({ show, message, product, onClose, duration = 3500 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      requestAnimationFrame(() => setVisible(true));
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 200);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const formattedPrice = product?.price
    ? Number(product.price).toLocaleString('es-AR')
    : null;
  const imageUrl = product?.imageUrl || product?.image;

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] pointer-events-auto max-w-[calc(100vw-2rem)] w-[380px]">
      <div
        className={`bg-surface rounded-lg shadow-lifted border border-border overflow-hidden transition-smooth ${
          visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
        }`}
      >
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between bg-surface-elevated/60">
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-status-success-bg text-status-success border border-status-success-border">
              <FiCheck size={11} />
            </span>
            <span className="text-xs font-medium text-content">
              Agregado al carrito
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-content-secondary hover:text-content p-1 rounded transition-colors"
            aria-label="Cerrar notificación"
          >
            <FiX size={14} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 bg-surface-elevated rounded border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product?.name || 'Producto'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiShoppingBag className="text-mauve text-lg" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-content text-xs sm:text-sm truncate font-sans">
                {product?.name || message || 'Producto'}
              </h4>
              {product?.variantDescription && (
                <p className="text-[11px] text-content-secondary truncate mt-0.5">
                  {product.variantDescription}
                </p>
              )}
              {formattedPrice && (
                <p className="text-xs font-semibold text-content mt-0.5">
                  {themeConfig.brand.currencySymbol}
                  {formattedPrice}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-border-subtle flex items-center gap-2">
            <Link
              to="/carrito"
              onClick={handleClose}
              className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-brand hover:bg-brand-hover text-content font-medium py-2 px-3 rounded-md text-xs transition-colors border border-mauve/30"
            >
              <FiShoppingBag size={13} />
              <span>Ver Carrito</span>
            </Link>
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-2 text-xs font-medium text-content-secondary hover:text-content hover:bg-surface-elevated rounded-md transition-colors"
            >
              Seguir viendo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
