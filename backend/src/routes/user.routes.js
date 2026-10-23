import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = Router();

// All user management routes require valid authentication and ADMIN role
router.use(auth, admin);

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;

