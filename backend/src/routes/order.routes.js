import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { validate } from '../middleware/validate.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator.js';

const router = Router();

router.post('/', optionalAuth, validate(createOrderSchema), orderController.createOrder);

router.get('/', auth, admin, orderController.getOrders);
router.get('/:id', auth, admin, orderController.getOrderById);
router.patch('/:id/status', auth, admin, validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
