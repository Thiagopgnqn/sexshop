/**
 * Integración con Píxel de Meta — Modo Privacidad Estricta (Nocturna SexShop)
 *
 * REGLAS OBLIGATORIAS:
 * 1. En modo demo (VITE_DEMO_MODE=true) o si VITE_META_PIXEL_ID no está definido:
 *    EL PÍXEL SE ENCUENTRA COMPLETAMENTE DESACTIVADO.
 * 2. PRIVACIDAD ESTRICTA: NINGÚN evento envía nombres de productos, categorías,
 *    marcas ni títulos de campañas en texto.
 * 3. Identificadores: solo IDs/SKUs en content_ids, content_type: 'product',
 *    y si hay campaña asociada solo se envía el ID numérico como parámetro (campaign_id).
 * 4. Valor (value): siempre es el precio final real que paga el cliente en Pesos Argentinos (ARS).
 */

import { isDemoMode } from '../api/demo/demoAdapter';

const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID || '').trim();
let initialized = false;

export const initMetaPixel = () => {
  // En modo demo NO se carga el Píxel ni se emiten eventos a Meta
  if (isDemoMode() || !PIXEL_ID || typeof window === 'undefined' || initialized) return;
  initialized = true;

  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
};

const safeTrack = (eventName, params) => {
  if (isDemoMode() || !PIXEL_ID || typeof window === 'undefined' || typeof window.fbq !== 'function') {
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
    value: Math.round(Number(price || 0)),
    currency: 'ARS',
  });
};

export const trackAddToCart = ({ id, sku, price, quantity = 1 } = {}) => {
  const cleanId = String(sku || id || '').trim();
  if (!cleanId) return;

  safeTrack('AddToCart', {
    content_ids: [cleanId],
    content_type: 'product',
    value: Math.round(Number(price || 0) * Number(quantity || 1)),
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
      orderId: arg1.orderId,
      campaignId: arg1.campaignId,
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
    value: Math.round(Number(total || 0)),
    currency: 'ARS',
    num_items: numItems,
  });
};

export const trackPurchase = (arg1, arg2) => {
  const { items, total, campaignId } = normalizeCheckoutArgs(arg1, arg2);
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

  const params = {
    content_ids: contentIds,
    content_type: 'product',
    value: Math.round(Number(total || 0)),
    currency: 'ARS',
    num_items: numItems,
  };

  // Solo ID numérico de campaña si existe, jamás el nombre textual
  if (campaignId) {
    const numericId = parseInt(String(campaignId).replace(/\D/g, ''), 10);
    if (!isNaN(numericId) && numericId > 0) {
      params.campaign_id = numericId;
    }
  }

  safeTrack('Purchase', params);
};
