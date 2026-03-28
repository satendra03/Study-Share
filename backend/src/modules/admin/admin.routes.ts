import { Router } from 'express';
import { adminController } from './admin.module.js';
import { verifyFirebaseToken, requireAppUser, requireAdmin, requireAdminOrTeacher } from '@/middlewares/auth.middleware.js';

const router = Router();

router.use(verifyFirebaseToken);
router.use(requireAppUser);
router.use(requireAdminOrTeacher);

// Stats
router.get('/stats', adminController.getStats);

// Users
router.get('/users', adminController.getUsers);
router.patch('/users/:userId/verify', adminController.verifyUser);
router.delete('/users/:userId', adminController.deleteUser);

// Materials
router.get('/materials', adminController.getMaterials);
router.delete('/materials/:materialId', adminController.deleteMaterial);

// Teachers — admin only
router.post('/teachers', requireAdmin, adminController.createTeacher);

export default {
    path: 'admin',
    router,
};
