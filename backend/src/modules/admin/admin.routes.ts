import { Router } from 'express';
import { adminController } from './admin.module.js';
import { verifyFirebaseToken, requireAppUser, requireAdmin } from '@/middlewares/auth.middleware.js';

const router = Router();

// All admin routes require admin access
router.use(verifyFirebaseToken);
router.use(requireAppUser);
router.use(requireAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/materials', adminController.getMaterials);

export default {
    path: 'admin',
    router,
};