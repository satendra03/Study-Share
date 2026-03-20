import { Router } from 'express';
import { adminController } from './admin.module.js';
import { verifyFirebaseToken, requireAppUser, requireAdmin } from '@/middlewares/auth.middleware.js';

const adminRouter = Router();

// All admin routes require admin access
adminRouter.use(verifyFirebaseToken);
adminRouter.use(requireAppUser);
adminRouter.use(requireAdmin);

adminRouter.get('/stats', adminController.getStats);
adminRouter.get('/users', adminController.getUsers);
adminRouter.get('/materials', adminController.getMaterials);
adminRouter.delete('/materials/:id', adminController.deleteMaterial);
adminRouter.patch('/users/:id/verify', adminController.verifyUser);

export default {
    path: 'admin',
    router: adminRouter,
};