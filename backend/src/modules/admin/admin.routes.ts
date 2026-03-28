import { Router } from 'express';
import { adminController } from './admin.module.js';
import { verifyFirebaseToken, requireAppUser, requireAdmin } from '@/middlewares/auth.middleware.js';

const router = Router();

// All admin routes require admin access
router.use(verifyFirebaseToken);
router.use(requireAppUser);
router.use(requireAdmin);

// Stats
router.get('/stats', adminController.getStats);

// Users
router.get('/users', adminController.getUsers);
router.patch('/users/:userId/verify', adminController.verifyUser);
router.delete('/users/:userId', adminController.deleteUser);

// Materials
router.get('/materials', adminController.getMaterials);
router.delete('/materials/:materialId', adminController.deleteMaterial);

// Teachers
router.post('/teachers', adminController.createTeacher);

export default {
    path: 'admin',
    router,
};
