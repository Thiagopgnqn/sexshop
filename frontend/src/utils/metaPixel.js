/**
 * Integración con Píxel de Meta — Modo Privacidad Estricta (Nocturna SexShop)
 *
 * Reglas:
 * 1. Si VITE_META_PIXEL_ID no está definido en variables de entorno, NO carga el script ni emite eventos.
 * 2. NINGÚN evento envía content_name, descripciones ni nombres de categoría.
 * 3. Únicamente se envían identificadores (SKU o ID) en content_ids, content_type, value, currency y num_items.
 */

const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID || '').trim();
let initialized = false;

export const initMetaPixel = () => {
  if (!PIXEL_ID || typeof window === 'undefined' || initialized) return;
  initialized = true;

  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
};

const safeTrack = (eventName, params) => {
  if (!PIXEL_ID || typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return;
  }
  window.fbq('track', eventName, params);
};

export const trackViewContent = ({ id, sku, price } = {}) => {
  const cleanId = String(sku || id || '').trim();
  if (!cleanId) return;

  safeTrack('ViewContent', {
    content_ids: [cleanId],
    content_type: 'product',
    value: Number(price || 0),
    currency: 'ARS',
  });
};

export const trackAddToCart = ({ id, sku, price, quantity = 1 } = {}) => {
  const cleanId = String(sku || id || '').trim();
  if (!cleanId) return;

  safeTrack('AddToCart', {
    content_ids: [cleanId],
    content_type: 'product',
    value: Number(price || 0) * Number(quantity || 1),
    currency: 'ARS',
    num_items: Number(quantity || 1),
  });
};

const normalizeCheckoutArgs = (arg1, arg2) => {
  if (Array.isArray(arg1)) {
    return { items: arg1, total: Number(arg2 || 0) };
  }
  if (arg1 && typeof arg1 === 'object') {
    return {
      items: Array.isArray(arg1.items) ? arg1.items : [],
      total: Number(arg1.total || 0),
    };
  }
  return { items: [], total: 0 };
};

export const trackInitiateCheckout = (arg1, arg2) => {
  const { items, total } = normalizeCheckoutArgs(arg1, arg2);
  const contentIds = items
    .map((item) =>
      String(
        item.variant?.sku ||
          item.product?.sku ||
          item.variant?.id ||
          item.product?.id ||
          ''
      ).trim()
    )
    .filter(Boolean);

  const numItems = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

  safeTrack('InitiateCheckout', {
    content_ids: contentIds,
    content_type: 'product',
    value: total,
    currency: 'ARS',
    num_items: numItems,
  });
};

export const trackPurchase = (arg1, arg2) => {
  const { items, total } = normalizeCheckoutArgs(arg1, arg2);
  const contentIds = items
    .map((item) =>
      String(
        item.variant?.sku ||
          item.product?.sku ||
          item.variant?.id ||
          item.product?.id ||
          ''
      ).trim()
    )
    .filter(Boolean);

  const numItems = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

  safeTrack('Purchase', {
    content_ids: contentIds,
    content_type: 'product',
    value: total,
    currency: 'ARS',
    num_items: numItems,
  });
};
