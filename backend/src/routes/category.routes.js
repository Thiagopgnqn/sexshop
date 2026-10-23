import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { validate } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';

const router = Router();

router.get('/', categoryController.getCategories);

router.post('/', auth, admin, validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', auth, admin, validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', auth, admin, categoryController.deleteCategory);

export default router;
