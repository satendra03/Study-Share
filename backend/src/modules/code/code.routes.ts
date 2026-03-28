import { Router } from 'express';
import { codeController } from './code.module.js';
import { verifyFirebaseToken, requireAppUser } from '@/middlewares/auth.middleware.js';
import { codeLimiter } from '@/middlewares/rateLimit.middleware.js';

const router = Router();

// Require authentication
router.use(verifyFirebaseToken);
router.use(requireAppUser);

router.post('/execute', codeLimiter, codeController.execute);

export default {
    path: 'code',
    router,
};