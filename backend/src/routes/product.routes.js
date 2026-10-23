import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { validate } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';

const router = Router();

router.get('/', productController.getProducts);
router.get('/filters', productController.getFilterOptions);
router.get('/:id', productController.getProductById);

router.post('/', auth, admin, validate(createProductSchema), productController.createProduct);
router.put('/:id', auth, admin, validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', auth, admin, productController.deleteProduct);

export default router;
