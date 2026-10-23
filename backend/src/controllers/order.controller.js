import * as orderService from '../services/order.service.js';

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user?.id; // Optional, depending on if auth middleware is applied
    const result = await orderService.createOrder(req.body, userId);
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('not found or inactive') || error.message.includes('Insufficient stock')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const result = await orderService.getOrders(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json(order);
  } catch (error) {
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.json(order);
  } catch (error) {
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};
