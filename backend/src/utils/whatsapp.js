import { env } from '../config/env.js';

export const generateWhatsAppLink = (order, items) => {
  const isPickup = order.deliveryMethod === 'PICKUP';
  const shortId = String(order.id || '').slice(0, 8).toUpperCase();

  let message = `Hola *Nocturna SexShop*, quiero confirmar mi pedido *#${shortId}*\n\n`;
  message += `*Datos de contacto:*\n`;
  message += `• Nombre: ${order.customerName}\n`;
  message += `• Teléfono: ${order.customerPhone}\n`;
  if (order.customerEmail) {
    message += `• Email: ${order.customerEmail}\n`;
  }

  message += `\n*Modalidad de entrega:* ${
    isPickup ? 'Retiro a coordinar (Córdoba)' : 'Envío discreto a domicilio'
  }\n`;

  if (!isPickup) {
    if (order.customerProvince) {
      message += `• Provincia: ${order.customerProvince}\n`;
    }
    if (order.customerCity) {
      message += `• Ciudad: ${order.customerCity}\n`;
    }
    if (order.customerPostalCode) {
      message += `• CP: ${order.customerPostalCode}\n`;
    }
    if (order.customerProvince && order.customerAddress) {
      const streetOnly = order.customerAddress.split(',')[0]?.trim();
      if (streetOnly) {
        message += `• Dirección: ${streetOnly}\n`;
      }
    } else if (order.customerAddress) {
      message += `• Dirección: ${order.customerAddress}\n`;
    }
  }

  message += `\n*Productos seleccionados:*\n`;
  items.forEach((item) => {
    const productName = item.product?.name || 'Producto';
    const sku = item.variant?.sku || item.product?.sku;
    const variantLabel = item.variantDescription
      ? ` [${item.variantDescription}]`
      : '';
    const skuLabel = sku ? ` (Cód: ${sku})` : '';
    const unitPriceFormatted = Number(item.unitPrice || 0).toLocaleString('es-AR');
    const subtotalFormatted = Number(item.subtotal || 0).toLocaleString('es-AR');

    message += `• ${item.quantity}x ${productName}${variantLabel}${skuLabel} — $${unitPriceFormatted} c/u ($${subtotalFormatted})\n`;
  });

  message += `\n*Total del pedido:* $${Number(order.total || 0).toLocaleString('es-AR')}\n`;

  if (order.comments) {
    message += `\n*Notas adicionales:* ${order.comments}\n`;
  }

  const phone = env.WHATSAPP_PHONE || '5493517572841';
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
};
