import React, { createContext, useState, useEffect, useCallback } from 'react';
import Toast from '../components/ui/Toast';
import { trackAddToCart } from '../utils/metaPixel';

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
      const saved = localStorage.getItem('nocturna_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nocturna_cart', JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }, [items]);

  const [notification, setNotification] = useState({ show: false, message: '', product: null });

  const closeNotification = useCallback(() => {
    setNotification({ show: false, message: '', product: null });
  }, []);

  const addToCart = (product, quantity = 1, variant = null) => {
    const productId = product.id || product._id;
    const variantId = variant?.id || null;
    const key = getCartItemKey(productId, variantId);
    const maxStock = variant ? Number(variant.stock ?? 0) : Number(product.stock ?? 0);
    const unitPrice = variant?.price != null ? Number(variant.price) : Number(product.price || 0);
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

    // Meta Pixel AddToCart — estrictamente ID/SKU numérico y valor, sin nombres ni categorías
    trackAddToCart({
      id: variant?.sku || product.sku || productId,
      price: unitPrice,
      quantity,
    });

    setNotification({
      show: true,
      message: `${product.name} agregado al carrito`,
      product: {
        name: product.name,
        price: unitPrice,
        imageUrl: product.imageUrl || product.image,
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

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = items.reduce((acc, item) => {
    const unitPrice =
      item.variant?.price != null ? Number(item.variant.price) : Number(item.product.price || 0);
    return acc + unitPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
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
