import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import Toast from '../components/ui/Toast';
import client from '../api/client';
import { trackAddToCart } from '../utils/metaPixel';
import { isDemoMode, loadDemoState, saveDemoState } from '../api/demo/demoAdapter';
import { resolveProductImage } from '../utils/productImages';

export const CartContext = createContext();

export const formatVariantDescription = (variant) => {
  if (!variant) return '';
  return [
    variant.type,
    variant.size ? `Talle ${variant.size}` : null,
    variant.color,
    variant.flavor,
    variant.volume,
  ]
    .filter(Boolean)
    .join(' • ');
};

export const getCartItemKey = (productId, variantId = null) =>
  variantId ? `${productId}__${variantId}` : `${productId}`;

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      if (isDemoMode()) {
        const demoState = loadDemoState();
        if (Array.isArray(demoState?.cart) && demoState.cart.length > 0) {
          return demoState.cart;
        }
      }
      const saved = localStorage.getItem('nocturna_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [couponCode, setCouponCode] = useState(() => {
    try {
      return localStorage.getItem('nocturna_coupon') || '';
    } catch {
      return '';
    }
  });

  const [paymentMethod, setPaymentMethod] = useState('TRANSFER');
  const [deliveryMethod, setDeliveryMethod] = useState('DELIVERY');
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);
  const [storeSettings, setStoreSettings] = useState(null);

  useEffect(() => {
    client.get('/settings')
      .then((res) => {
        if (res.data) setStoreSettings(res.data);
      })
      .catch((err) => {
        console.warn('No se pudo cargar settings en CartContext:', err.message);
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nocturna_cart', JSON.stringify(items));
      if (isDemoMode()) {
        const demoState = loadDemoState();
        demoState.cart = items;
        saveDemoState(demoState);
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [items]);

  const fetchQuote = useCallback(async (currentItems, code, payMethod, delMethod) => {
    if (!Array.isArray(currentItems) || currentItems.length === 0) {
      setQuote(null);
      setCouponError(null);
      return;
    }
    setQuoteLoading(true);
    try {
      const payload = {
        items: currentItems.map((it) => ({
          productId: it.product.id || it.product._id,
          variantId: it.variant?.id || null,
          quantity: it.quantity,
        })),
        couponCode: code ? code.trim() : null,
        paymentMethod: payMethod || 'TRANSFER',
        shippingContext: {
          deliveryMethod: delMethod || 'DELIVERY',
        },
      };
      const res = await client.post('/cart/quote', payload);
      setQuote(res.data);
      if (code && code.trim()) {
        if (res.data?.couponError) {
          setCouponError(res.data.couponError);
          setCouponSuccess(null);
        } else if (res.data?.coupon) {
          setCouponError(null);
          setCouponSuccess(`¡Cupón ${res.data.coupon.code} aplicado con éxito!`);
        }
      } else {
        setCouponError(null);
        setCouponSuccess(null);
      }
    } catch (err) {
      console.error('Error al cotizar carrito:', err);
    } finally {
      setQuoteLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuote(items, couponCode, paymentMethod, deliveryMethod);
  }, [items, couponCode, paymentMethod, deliveryMethod, fetchQuote]);

  const applyCoupon = async (code) => {
    const clean = String(code || '').trim().toUpperCase();
    if (!clean) {
      setCouponError('Ingresá un código de cupón.');
      return;
    }
    setCouponCode(clean);
    try {
      localStorage.setItem('nocturna_coupon', clean);
    } catch {
      // ignore
    }
    fetchQuote(items, clean, paymentMethod, deliveryMethod);
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponError(null);
    setCouponSuccess(null);
    try {
      localStorage.removeItem('nocturna_coupon');
    } catch {
      // ignore
    }
    fetchQuote(items, '', paymentMethod, deliveryMethod);
  };

  const [notification, setNotification] = useState({ show: false, message: '', product: null });

  const closeNotification = useCallback(() => {
    setNotification({ show: false, message: '', product: null });
  }, []);

  const addToCart = (product, quantity = 1, variant = null) => {
    const productId = product.id || product._id;
    const variantId = variant?.id || null;
    const key = getCartItemKey(productId, variantId);
    const maxStock = variant ? Number(variant.stock ?? 0) : Number(product.stock ?? 0);
    const unitPrice =
      variant?.pricing?.finalPrice != null
        ? Number(variant.pricing.finalPrice)
        : variant?.price != null
        ? Number(variant.price)
        : product?.pricing?.finalPrice != null
        ? Number(product.pricing.finalPrice)
        : Number(product.price || 0);
    const variantDescription = formatVariantDescription(variant);

    if (maxStock <= 0) return;

    setItems((prev) => {
      const existing = prev.find((item) => {
        const itemProdId = item.product.id || item.product._id;
        const itemVarId = item.variant?.id || null;
        return getCartItemKey(itemProdId, itemVarId) === key;
      });

      if (existing) {
        return prev.map((item) => {
          const itemProdId = item.product.id || item.product._id;
          const itemVarId = item.variant?.id || null;
          if (getCartItemKey(itemProdId, itemVarId) === key) {
            return {
              ...item,
              quantity: Math.min(item.quantity + quantity, maxStock),
            };
          }
          return item;
        });
      }

      return [
        ...prev,
        {
          key,
          product,
          variant: variant || null,
          variantDescription,
          quantity: Math.min(quantity, maxStock),
        },
      ];
    });

    // Meta Pixel AddToCart
    trackAddToCart({
      id: variant?.sku || product.sku || productId,
      price: unitPrice,
      quantity,
    });

    const resolvedImg = resolveProductImage(product, variant);
    setNotification({
      show: true,
      message: `${product.name} agregado al carrito`,
      product: {
        name: product.name,
        price: unitPrice,
        imageUrl: resolvedImg?.thumb || resolvedImg?.main || product.imageUrl || product.image,
        variantDescription,
      },
    });
  };

  const removeFromCart = (productId, variantId = null) => {
    const targetKey = getCartItemKey(productId, variantId);
    setItems((prev) =>
      prev.filter((item) => {
        const itemProdId = item.product.id || item.product._id;
        const itemVarId = item.variant?.id || null;
        return getCartItemKey(itemProdId, itemVarId) !== targetKey;
      })
    );
  };

  const updateQuantity = (productId, quantity, variantId = null) => {
    const targetKey = getCartItemKey(productId, variantId);
    setItems((prev) =>
      prev.map((item) => {
        const itemProdId = item.product.id || item.product._id;
        const itemVarId = item.variant?.id || null;
        if (getCartItemKey(itemProdId, itemVarId) === targetKey) {
          const maxStock = item.variant
            ? Number(item.variant.stock ?? 0)
            : Number(item.product.stock ?? 0);
          return { ...item, quantity: Math.max(1, Math.min(quantity, maxStock)) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setQuote(null);
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const fallbackSubtotal = items.reduce((acc, item) => {
    const unitPrice =
      item.variant?.price != null ? Number(item.variant.price) : Number(item.product.price || 0);
    return acc + unitPrice * item.quantity;
  }, 0);

  const cartSubtotal = quote?.subtotal != null ? quote.subtotal : fallbackSubtotal;
  const cartTotal = quote?.total != null ? quote.total : fallbackSubtotal;
  const totalSavings = quote?.totalSavings ?? 0;

  // Barra de progreso de envío gratis
  const freeShippingThreshold = quote?.shipping?.freeShippingThreshold || storeSettings?.freeShippingThreshold || 45000;
  const transferDiscountPercent =
    storeSettings?.transferDiscountEnabled !== false ? (storeSettings?.transferDiscountPercent ?? 10) : 0;
  const transferDiscountEnabled = storeSettings?.transferDiscountEnabled !== false && transferDiscountPercent > 0;

  const subtotalForShipping = quote?.subtotalAfterPromotions ?? cartSubtotal;
  const isFreeShipping = Boolean(quote?.shipping?.isFree);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotalForShipping);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotalForShipping / freeShippingThreshold) * 100)
  );

  // Aviso de promoción por cantidad (ej: 2x1 en Cosmética íntima)
  const quantityPromoNotice = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return null;
    for (const it of items) {
      const cat = it.product?.category?.slug || it.product?.category?.name || it.product?.categoryId || '';
      if (cat.toLowerCase().includes('cosmetica') && it.quantity % 2 !== 0) {
        return {
          title: '¡Promoción 2x1 en Cosmética!',
          text: 'Agregá 1 unidad más de Cosmética íntima y llevate el 2x1 en tu compra.',
          type: '2x1',
        };
      }
    }
    return null;
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartTotal,
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
        deliveryMethod,
        setDeliveryMethod,
        freeShippingThreshold,
        remainingForFreeShipping,
        freeShippingProgress,
        isFreeShipping,
        quantityPromoNotice,
        storeSettings,
        transferDiscountPercent,
        transferDiscountEnabled,
      }}
    >
      {children}
      <Toast
        show={notification.show}
        message={notification.message}
        product={notification.product}
        onClose={closeNotification}
      />
    </CartContext.Provider>
  );
};
