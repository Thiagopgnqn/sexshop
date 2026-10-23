import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';
import CheckoutForm from '../components/checkout/CheckoutForm';
import ProductPlaceholder from '../components/ui/ProductPlaceholder';
import { trackInitiateCheckout } from '../utils/metaPixel';
import { formatVariantDescription } from '../context/CartContext';
import { FiLock, FiShield } from 'react-icons/fi';
import themeConfig from '../config/theme';
import useSEO from '../hooks/useSEO';

const CheckoutPage = () => {
  const { items, cartTotal, cartCount } = useCart();
  const [orderCompleted, setOrderCompleted] = React.useState(false);
  const navigate = useNavigate();

  useSEO({
    title: `Finalizar Pedido | ${themeConfig.brand.name}`,
    description: 'Confirmá tu pedido en Nocturna SexShop con envío 100% discreto en Córdoba.',
  });

  useEffect(() => {
    if (items.length === 0 && !orderCompleted) {
      navigate('/carrito');
      return;
    }
    if (items.length > 0) {
      trackInitiateCheckout({ items, total: cartTotal });
    }
  }, [items.length, orderCompleted, navigate]);

  if (items.length === 0 && !orderCompleted) return null;

  return (
    <div className="bg-canvas min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado y banner de seguridad */}
        <div className="mb-8 pb-4 border-b border-brand-border/20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-mauve font-medium">
              Confirmación Confidencial
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-light uppercase tracking-widest text-content mt-1">
              Finalizar Pedido
            </h1>
          </div>
          <div className="flex items-center gap-2 text-content-secondary">
            <FiLock className="text-mauve text-xs" />
            <span className="text-xs font-medium uppercase tracking-widest text-content-secondary">
              Checkout Confidencial &bull; Coordinación por WhatsApp
            </span>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-10 lg:items-start">
          {/* Formulario de Checkout */}
          <div className={orderCompleted ? 'lg:col-span-12 max-w-xl mx-auto w-full' : 'lg:col-span-7'}>
            <CheckoutForm onOrderSuccess={() => setOrderCompleted(true)} />
          </div>

          {/* Resumen de la Orden */}
          {!orderCompleted && (
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-surface rounded-lg p-6 sm:p-7 border border-brand-border/20 sticky top-24">
              <div className="pb-3 mb-4 border-b border-brand-border/15">
                <h2 className="font-display text-sm uppercase tracking-widest text-content">
                  Tu Pedido
                </h2>
                <p className="text-xs text-content-muted mt-0.5">
                  {cartCount}{' '}
                  {cartCount === 1
                    ? themeConfig.brand.unitName
                    : themeConfig.brand.unitNamePlural}{' '}
                  en tu selección
                </p>
              </div>

              <ul className="divide-y divide-brand-border/15 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => {
                  const unitPrice =
                    item.variant?.price != null
                      ? Number(item.variant.price)
                      : Number(item.product.price || 0);
                  const variantLabel =
                    item.variantDescription || formatVariantDescription(item.variant);
                  return (
                    <li
                      key={item.key || `${item.product._id || item.product.id}__${item.variant?.id || 'base'}`}
                      className="py-3 flex items-center gap-3"
                    >
                      <div className="h-12 w-12 flex-shrink-0 bg-canvas rounded border border-brand-border/20 overflow-hidden flex items-center justify-center">
                        {(item.product.imageUrl || item.product.image) ? (
                          <img
                            src={item.product.imageUrl || item.product.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ProductPlaceholder size="sm" showLabel={false} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-medium text-content truncate">
                          {item.product.name}
                        </h3>
                        {variantLabel && (
                          <p className="text-[11px] text-mauve truncate">{variantLabel}</p>
                        )}
                        <p className="text-[11px] text-content-muted">Cant: {item.quantity} un.</p>
                      </div>
                      <p className="text-xs font-semibold text-content">
                        {themeConfig.brand.currencySymbol}
                        {(unitPrice * item.quantity).toLocaleString('es-AR')}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <dl className="mt-4 border-t border-brand-border/15 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-content-secondary">
                  <dt>Subtotal productos</dt>
                  <dd className="font-semibold text-content">
                    {themeConfig.brand.currencySymbol}{cartTotal.toLocaleString('es-AR')}
                  </dd>
                </div>
                <div className="flex justify-between text-content-secondary">
                  <dt>Entrega / Retiro</dt>
                  <dd className="text-content-secondary font-medium">A coordinar por WhatsApp</dd>
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-content pt-3 border-t border-brand-border/25">
                  <dt>Total Estimado</dt>
                  <dd className="text-lg font-semibold text-content tracking-tight">
                    {themeConfig.brand.currencySymbol}{cartTotal.toLocaleString('es-AR')}
                  </dd>
                </div>
              </dl>

              {/* Avisos de discreción y política de cambios */}
              <div className="mt-5 p-3.5 rounded bg-surface-elevated/70 border border-brand-border/25 text-xs text-content-secondary space-y-2 leading-relaxed">
                <div className="flex items-start gap-2">
                  <FiShield className="text-mauve mt-0.5 flex-shrink-0" />
                  <p className="text-content font-medium">{themeConfig.legal.discreetNotice}</p>
                </div>
                <p className="text-[11px] text-content-muted">
                  {themeConfig.legal.returnsPolicyNotice}
                </p>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
