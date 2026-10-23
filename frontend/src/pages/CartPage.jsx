import React from 'react';
import { Link } from 'react-router-dom';
import useCart from '../hooks/useCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import Button from '../components/ui/Button';
import { FiShoppingBag, FiArrowRight, FiShield } from 'react-icons/fi';
import themeConfig from '../config/theme';
import useSEO from '../hooks/useSEO';

const CartPage = () => {
  const { items } = useCart();

  useSEO({
    title: 'Tu Carrito',
    description: 'Revisá tu selección en Nocturna SexShop. Envíos 100% discretos en Córdoba.',
  });

  return (
    <div className="bg-canvas min-h-[75vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="mb-8 pb-4 border-b border-brand-border/20">
          <span className="text-[11px] uppercase tracking-widest text-mauve font-medium">
            Selección Privada
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-light uppercase tracking-widest text-content mt-1">
            Carrito de Compras
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 px-4 bg-surface rounded-lg border border-brand-border/20 max-w-lg mx-auto">
            <FiShoppingBag className="mx-auto text-4xl text-mauve/40 mb-4" />
            <h2 className="font-display text-lg uppercase tracking-widest text-content mb-2">
              Tu carrito está vacío
            </h2>
            <p className="text-content-secondary text-xs sm:text-sm mb-6 max-w-sm mx-auto leading-relaxed">
              Explorá nuestra colección de bienestar íntimo, lencería y cosmética sensorial con entrega confidencial en Córdoba.
            </p>
            <Link to="/catalogo">
              <Button variant="primary" size="lg" className="px-6 text-xs sm:text-sm">
                <span>Explorar Catálogo</span>
                <FiArrowRight className="ml-2 text-xs" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-10 lg:items-start">
            {/* Lista de productos */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-surface p-6 sm:p-7 rounded-lg border border-brand-border/20">
                <div className="divide-y divide-brand-border/15">
                  {items.map((item) => (
                    <CartItem
                      key={item.key || `${item.product._id || item.product.id}__${item.variant?.id || 'base'}`}
                      item={item}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-surface/60 border border-brand-border/15 rounded-lg p-4 flex items-start gap-3">
                <FiShield className="text-mauve mt-0.5 flex-shrink-0" />
                <div className="text-xs text-content-secondary space-y-1">
                  <p className="text-content font-medium">{themeConfig.legal.discreetNotice}</p>
                  <p>{themeConfig.legal.returnsPolicyNotice}</p>
                </div>
              </div>
            </div>

            {/* Resumen de compra */}
            <div className="lg:col-span-5 mt-8 lg:mt-0">
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
