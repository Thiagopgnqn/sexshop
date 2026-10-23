import React from 'react';
import { Link } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import Button from '../ui/Button';
import { FiShield, FiArrowRight, FiLock } from 'react-icons/fi';
import themeConfig from '../../config/theme';

const CartSummary = ({ isDrawer = false, onCloseDrawer }) => {
  const { cartCount, cartTotal } = useCart();
  const totalFormatted = Number(cartTotal || 0).toLocaleString('es-AR');

  return (
    <div className={`bg-surface rounded-lg border border-brand-border/20 ${isDrawer ? 'p-5' : 'p-6 lg:p-7'}`}>
      <div className="pb-3 mb-4 border-b border-brand-border/15">
        <h2 className="font-display text-sm uppercase tracking-widest text-content">Resumen del Pedido</h2>
        <p className="text-xs text-content-muted mt-0.5">Coordinación personalizada y confidencial</p>
      </div>

      <div className="flow-root">
        <dl className="text-xs divide-y divide-brand-border/15">
          <div className="py-2.5 flex items-center justify-between">
            <dt className="text-content-secondary">
              Subtotal ({cartCount} {cartCount === 1 ? themeConfig.brand.unitName : themeConfig.brand.unitNamePlural})
            </dt>
            <dd className="font-semibold text-content">
              {themeConfig.brand.currencySymbol}{totalFormatted}
            </dd>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <dt className="text-content-secondary">Entrega / Retiro</dt>
            <dd className="text-content-secondary font-medium">A coordinar por WhatsApp</dd>
          </div>
          <div className="py-3.5 flex items-center justify-between border-t border-brand-border/25">
            <dt className="text-sm font-medium text-content">Total Estimado</dt>
            <dd className="text-xl font-semibold text-content tracking-tight">
              {themeConfig.brand.currencySymbol}{totalFormatted}
            </dd>
          </div>
        </dl>
      </div>

      {/* Aviso de privacidad y discreción */}
      <div className="mt-4 bg-surface-elevated/70 border border-brand-border/25 rounded p-3.5 flex items-start gap-2.5">
        <FiShield className="text-mauve mt-0.5 flex-shrink-0 text-sm" />
        <p className="text-[11px] text-content-secondary leading-relaxed">
          {themeConfig.legal.discreetNotice}
        </p>
      </div>

      {/* Botón de acción */}
      <div className="mt-6">
        <Link to="/checkout" onClick={onCloseDrawer} className="w-full block">
          <Button fullWidth variant="primary" size="lg" className="text-xs sm:text-sm py-3">
            <FiLock className="mr-2 text-xs" />
            <span>Continuar al Checkout</span>
            <FiArrowRight className="ml-2 text-xs" />
          </Button>
        </Link>
      </div>

      <div className="mt-4 text-center">
        <Link
          to="/catalogo"
          onClick={onCloseDrawer}
          className="text-xs text-content-muted hover:text-content transition-colors font-medium"
        >
          &larr; Seguir explorando el catálogo
        </Link>
      </div>
    </div>
  );
};

export default CartSummary;
