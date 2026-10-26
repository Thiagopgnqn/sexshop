import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import {
  FiShield,
  FiArrowRight,
  FiLock,
  FiTruck,
  FiTag,
  FiPercent,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiGift,
} from 'react-icons/fi';
import themeConfig from '../../config/theme';

const CartSummary = ({ isDrawer = false, onCloseDrawer }) => {
  const {
    cartCount,
    cartTotal,
    cartSubtotal,
    totalSavings,
    quote,
    quoteLoading,
    couponCode,
    couponError,
    couponSuccess,
    applyCoupon,
    removeCoupon,
    paymentMethod,
    setPaymentMethod,
    freeShippingThreshold,
    remainingForFreeShipping,
    freeShippingProgress,
    isFreeShipping,
    quantityPromoNotice,
    transferDiscountPercent,
    transferDiscountEnabled,
    storeSettings,
  } = useCart();

  const [inputCode, setInputCode] = useState(couponCode || '');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (inputCode.trim()) {
      applyCoupon(inputCode.trim());
    }
  };

  const totalFormatted = Number(cartTotal || 0).toLocaleString('es-AR');
  const subtotalFormatted = Number(quote?.subtotal || cartSubtotal || 0).toLocaleString('es-AR');
  const savingsFormatted = Number(totalSavings || 0).toLocaleString('es-AR');

  return (
    <div
      className={`bg-surface rounded-xl border border-brand-border/25 ${
        isDrawer ? 'p-5' : 'p-6 lg:p-7'
      } space-y-5`}
    >
      <div className="pb-3 border-b border-brand-border/15">
        <h2 className="font-display text-sm uppercase tracking-widest text-content">
          Resumen del Pedido
        </h2>
        <p className="text-xs text-content-muted mt-0.5">
          Precios finales garantizados sin cargos ocultos
        </p>
      </div>

      {/* 1. Barra de Progreso de Envío Gratis */}
      <div className="p-3.5 rounded-lg bg-surface-elevated/70 border border-brand-border/25 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-content inline-flex items-center gap-1.5">
            <FiTruck className="text-mauve" />
            <span>
              {isFreeShipping
                ? '¡Felicitaciones! Tenés Envío Gratis'
                : `Te faltan $${remainingForFreeShipping.toLocaleString('es-AR')} para envío gratis`}
            </span>
          </span>
          <span className="text-[11px] font-semibold text-mauve">
            {freeShippingProgress}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-canvas overflow-hidden border border-brand-border/20">
          <div
            className="h-full bg-gradient-to-r from-mauve to-brand transition-all duration-500 ease-out"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
        <p className="text-[10px] text-content-muted">
          Envío bonificado a todo Córdoba en compras superiores a $
          {Number(freeShippingThreshold).toLocaleString('es-AR')}.
        </p>
      </div>

      {/* 2. Aviso de Promoción por Cantidad (ej: 2x1 en Cosmética) */}
      {quantityPromoNotice && (
        <div className="p-3.5 rounded-lg bg-brand/30 border border-mauve/40 flex items-start gap-2.5">
          <FiGift className="text-mauve mt-0.5 flex-shrink-0" size={15} />
          <div className="text-xs">
            <p className="font-semibold text-content">{quantityPromoNotice.title}</p>
            <p className="text-content-secondary mt-0.5 leading-snug">
              {quantityPromoNotice.text}
            </p>
          </div>
        </div>
      )}

      {/* 3. Selector de Método de Pago */}
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider text-content-secondary font-medium">
          Método de Pago Preferido:
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setPaymentMethod('TRANSFER')}
            className={`p-2.5 rounded-md border text-left transition-all ${
              paymentMethod === 'TRANSFER'
                ? 'bg-brand/50 border-mauve text-content ring-1 ring-mauve/40'
                : 'bg-canvas border-brand-border/25 text-content-secondary hover:text-content hover:border-mauve/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Transferencia bancaria</span>
              {transferDiscountEnabled && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                  {transferDiscountPercent}% OFF
                </span>
              )}
            </div>
            <p className="text-[10px] text-content-muted mt-1 truncate">
              {transferDiscountEnabled ? `${transferDiscountPercent}% de ahorro directo` : 'Pago por transferencia'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('OTHER')}
            className={`p-2.5 rounded-md border text-left transition-all ${
              paymentMethod === 'OTHER'
                ? 'bg-brand/50 border-mauve text-content ring-1 ring-mauve/40'
                : 'bg-canvas border-brand-border/25 text-content-secondary hover:text-content hover:border-mauve/30'
            }`}
          >
            <span className="font-medium">Efectivo / Otro</span>
            <p className="text-[10px] text-content-muted mt-1 truncate">
              Al retirar o coordinar
            </p>
          </button>
        </div>
      </div>

      {/* 4. Campo de Cupón con validación en vivo */}
      <div className="space-y-2 pt-2 border-t border-brand-border/15">
        <label className="block text-xs uppercase tracking-wider text-content-secondary font-medium">
          ¿Tenés un cupón de descuento?
        </label>

        {quote?.coupon ? (
          <div className="flex items-center justify-between p-2.5 rounded-md bg-surface-elevated border border-emerald-700/40 text-xs">
            <div className="flex items-center gap-2">
              <FiTag className="text-emerald-400" />
              <div>
                <span className="font-mono font-bold text-content">
                  {quote.coupon.code}
                </span>
                <span className="text-emerald-400 ml-2">
                  (-${Number(quote.coupon.discount || 0).toLocaleString('es-AR')})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={removeCoupon}
              className="text-content-muted hover:text-rose-400 p-1"
              title="Quitar cupón"
              aria-label="Quitar cupón"
            >
              <FiX size={14} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Código de cupón"
              className="flex-1 px-3 py-2 bg-canvas border border-brand-border/30 rounded text-xs text-content placeholder-content-muted font-mono uppercase focus:outline-none focus:border-mauve"
            />
            <Button
              type="submit"
              variant="secondary"
              disabled={quoteLoading || !inputCode.trim()}
              className="px-4 py-2 text-xs"
            >
              {quoteLoading ? 'Validando...' : 'Aplicar'}
            </Button>
          </form>
        )}

        {couponError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-900/40 px-2.5 py-1.5 rounded">
            <FiAlertCircle size={13} className="flex-shrink-0" />
            <span>{couponError}</span>
          </div>
        )}

        {couponSuccess && !couponError && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2.5 py-1.5 rounded">
            <FiCheck size={13} className="flex-shrink-0" />
            <span>{couponSuccess}</span>
          </div>
        )}
      </div>

      {/* 5. Desglose detallado de precios y descuentos */}
      <div className="flow-root pt-3 border-t border-brand-border/15">
        <dl className="text-xs space-y-2">
          {/* Subtotal base */}
          <div className="flex items-center justify-between">
            <dt className="text-content-secondary">
              Subtotal ({cartCount}{' '}
              {cartCount === 1 ? themeConfig.brand.unitName : themeConfig.brand.unitNamePlural})
            </dt>
            <dd className="font-semibold text-content">
              {themeConfig.brand.currencySymbol}
              {subtotalFormatted}
            </dd>
          </div>

          {/* Descuentos individuales en productos */}
          {quote?.itemDiscountsTotal > 0 && (
            <div className="flex items-center justify-between text-emerald-400">
              <dt className="inline-flex items-center gap-1">
                <span>Descuentos en productos</span>
              </dt>
              <dd className="font-medium">
                -{themeConfig.brand.currencySymbol}
                {Number(quote.itemDiscountsTotal).toLocaleString('es-AR')}
              </dd>
            </div>
          )}

          {/* Promociones aplicadas a nivel carrito (ej: 2x1, combos, escalonados) */}
          {Array.isArray(quote?.appliedPromotions) &&
            quote.appliedPromotions.map((promo) => (
              <div
                key={promo.id || promo.name}
                className="flex items-center justify-between text-emerald-400"
              >
                <dt className="truncate pr-2">
                  <span>{promo.name}</span>
                </dt>
                <dd className="font-medium whitespace-nowrap">
                  -{themeConfig.brand.currencySymbol}
                  {Number(promo.discount).toLocaleString('es-AR')}
                </dd>
              </div>
            ))}

          {/* Cupón aplicado */}
          {quote?.couponDiscount > 0 && (
            <div className="flex items-center justify-between text-emerald-400">
              <dt className="inline-flex items-center gap-1">
                <span>Cupón ({quote.coupon?.code})</span>
              </dt>
              <dd className="font-medium">
                -{themeConfig.brand.currencySymbol}
                {Number(quote.couponDiscount).toLocaleString('es-AR')}
              </dd>
            </div>
          )}

          {/* Descuento por Transferencia */}
          {quote?.paymentMethodDiscount > 0 && (
            <div className="flex items-center justify-between text-emerald-400">
              <dt className="inline-flex items-center gap-1">
                <span>Bonificación Transferencia bancaria ({transferDiscountPercent}%)</span>
              </dt>
              <dd className="font-medium">
                -{themeConfig.brand.currencySymbol}
                {Number(quote.paymentMethodDiscount).toLocaleString('es-AR')}
              </dd>
            </div>
          )}

          {/* Costo de Envío */}
          <div className="flex items-center justify-between">
            <dt className="text-content-secondary">Envío a domicilio</dt>
            <dd className="font-medium text-content">
              {isFreeShipping ? (
                <span className="text-emerald-400 font-semibold uppercase text-[11px] tracking-wider">
                  ¡Gratis!
                </span>
              ) : (
                `${themeConfig.brand.currencySymbol}${Number(
                  quote?.shipping?.finalCost || storeSettings?.shippingCost || 4500
                ).toLocaleString('es-AR')}`
              )}
            </dd>
          </div>

          {/* Total Final */}
          <div className="pt-3 flex items-baseline justify-between border-t border-brand-border/25">
            <dt className="text-sm font-semibold text-content">Total Final</dt>
            <dd className="text-2xl font-bold text-content tracking-tight">
              {themeConfig.brand.currencySymbol}
              {totalFormatted}
            </dd>
          </div>
        </dl>

        {/* Ahorro Total Comprobado */}
        {totalSavings > 0 && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-center">
            <p className="text-xs font-semibold text-emerald-300">
              ¡Ahorrás {themeConfig.brand.currencySymbol}
              {savingsFormatted} en este pedido!
            </p>
          </div>
        )}
      </div>

      {/* Aviso de privacidad y discreción */}
      <div className="bg-surface-elevated/70 border border-brand-border/25 rounded p-3 flex items-start gap-2.5">
        <FiShield className="text-mauve mt-0.5 flex-shrink-0 text-sm" />
        <p className="text-[11px] text-content-secondary leading-relaxed">
          {themeConfig.legal.discreetNotice}
        </p>
      </div>

      {/* Botón de acción */}
      <div className="pt-2">
        <Link to="/checkout" onClick={onCloseDrawer} className="w-full block">
          <Button fullWidth variant="primary" size="lg" className="text-xs sm:text-sm py-3.5">
            <FiLock className="mr-2 text-xs" />
            <span>Continuar al Checkout</span>
            <FiArrowRight className="ml-2 text-xs" />
          </Button>
        </Link>
      </div>

      <div className="text-center">
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