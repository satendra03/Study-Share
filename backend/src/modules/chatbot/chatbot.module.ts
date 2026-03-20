import { ChatbotController } from './chatbot.controller.js';
import { ChatbotService } from './service/chatbot.service.js';

const chatbotService = new ChatbotService();
const chatbotController = new ChatbotController(chatbotService);

export { chatbotController, chatbotService };