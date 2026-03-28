import { Router } from 'express';
import { chatbotController } from './chatbot.module.js';
import { verifyFirebaseToken, requireAppUser } from '@/middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(verifyFirebaseToken);
router.use(requireAppUser);

router.get('/sessions', chatbotController.getSessions);
router.post('/sessions', chatbotController.createSession);
router.get('/sessions/:id', chatbotController.getSession);
router.delete('/sessions/:id', chatbotController.deleteSession);
router.post('/sessions/:id/messages', chatbotController.sendMessage);
router.get('/sessions/:id/messages', chatbotController.getMessages);

export default {
    path: 'chatbot',
    router,
};