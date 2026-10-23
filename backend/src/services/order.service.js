import { PrismaClient } from '@prisma/client';
import { generateWhatsAppLink } from '../utils/whatsapp.js';
import { sendMetaPurchaseEvent } from './meta.service.js';

const prisma = new PrismaClient();

export const formatVariantDescription = (variant) => {
  if (!variant) return null;
  const parts = [];
  if (variant.type) parts.push(variant.type);
  if (variant.size) parts.push(`Talle: ${variant.size}`);
  if (variant.color) parts.push(`Color: ${variant.color}`);
  if (variant.flavor) parts.push(`Aroma/Sabor: ${variant.flavor}`);
  if (variant.volume) parts.push(variant.volume);
  return parts.length > 0 ? parts.join(' · ') : `SKU ${variant.sku}`;
};

export const createOrder = async (data, userId) => {
  const result = await prisma.$transaction(async (tx) => {
    let total = 0;
    const itemsData = [];

    for (const item of data.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product || !product.active) {
        throw new Error(`Product ${item.productId} not found or inactive`);
      }

      let selectedVariant = null;
      if (item.variantId) {
        selectedVariant = product.variants.find(
          (v) => v.id === item.variantId && v.active
        );
        if (!selectedVariant) {
          throw new Error(`Variant ${item.variantId} not found or inactive for ${product.name}`);
        }
        if (selectedVariant.stock < item.quantity) {
          throw new Error(`Insufficient stock for variant of ${product.name}`);
        }
      } else if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      const unitPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
      const subtotal = unitPrice * item.quantity;
      total += subtotal;

      const variantDesc =
        item.variantDescription ||
        (selectedVariant ? formatVariantDescription(selectedVariant) : null);

      itemsData.push({
        productId: product.id,
        variantId: selectedVariant ? selectedVariant.id : null,
        variantDescription: variantDesc,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });

      if (selectedVariant) {
        await tx.productVariant.update({
          where: { id: selectedVariant.id },
          data: {
            stock: selectedVariant.stock - item.quantity,
          },
        });
      }

      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: Math.max(0, product.stock - item.quantity),
          soldCount: product.soldCount + item.quantity,
        },
      });
    }

    const order = await tx.order.create({
      data: {
        userId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        customerAddress: data.customerAddress,
        deliveryMethod: data.deliveryMethod,
        comments: data.comments,
        total,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    const whatsappLink = generateWhatsAppLink(
      {
        ...order,
        customerProvince: data.customerProvince,
        customerCity: data.customerCity,
        customerPostalCode: data.customerPostalCode,
      },
      order.items
    );

    return { order, whatsappLink };
  });

  sendMetaPurchaseEvent(result.order, result.order.items);
  return result;
};

export const getOrders = async (filters) => {
  const { page = 1, limit = 10, status } = filters;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const where = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
};

export const getOrderById = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });
  if (!order) throw new Error('Order not found');
  return order;
};

export const updateOrderStatus = async (id, status) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) throw new Error('Order not found');

    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            soldCount: { decrement: item.quantity },
          },
        });
      }
    } else if (order.status === 'CANCELLED' && status !== 'CANCELLED') {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }
    }

    return tx.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  });
};
