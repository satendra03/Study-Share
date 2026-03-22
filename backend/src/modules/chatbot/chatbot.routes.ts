import { Router } from 'express';
import { chatbotController } from './chatbot.module.js';
import { verifyFirebaseToken, requireAppUser } from '@/middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(verifyFirebaseToken);
router.use(requireAppUser);

router.post("/chat", chatbotController.chat);

export default {
    path: 'chatbot',
    router,
};