import crypto from 'crypto';
import { env } from '../config/env.js';

const sha256 = (value) => {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
};

/**
 * Envía el evento Purchase a la API de Conversiones de Meta (CAPI)
 * MODO PRIVACIDAD ESTRICTA:
 * - Solo se ejecuta si META_PIXEL_ID y META_CAPI_ACCESS_TOKEN están configurados.
 * - JAMÁS envía content_name, descripciones de productos ni nombres de categorías.
 * - Solo envía content_ids (SKU o ID), content_type, value, currency y num_items.
 */
export const sendMetaPurchaseEvent = async (order, items = []) => {
  if (!env.META_PIXEL_ID || !env.META_CAPI_ACCESS_TOKEN) {
    return;
  }

  try {
    const contentIds = items.map((item) =>
      String(item.variant?.sku || item.product?.sku || item.variantId || item.productId)
    );
    const numItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    const payload = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_id: `order_${order.id}`,
          action_source: 'website',
          user_data: {
            em: order.customerEmail ? [sha256(order.customerEmail)] : undefined,
            ph: order.customerPhone
              ? [sha256(String(order.customerPhone).replace(/\D/g, ''))]
              : undefined,
          },
          custom_data: {
            currency: 'ARS',
            value: Number(order.total || 0),
            content_ids: contentIds,
            content_type: 'product',
            num_items: numItems,
          },
        },
      ],
    };

    const url = `https://graph.facebook.com/v19.0/${encodeURIComponent(
      env.META_PIXEL_ID
    )}/events?access_token=${encodeURIComponent(env.META_CAPI_ACCESS_TOKEN)}`;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[Meta CAPI] Error no bloqueante al enviar Purchase:', err.message);
  }
};
