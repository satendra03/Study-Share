import { ChatbotController } from './chatbot.controller.js';
import { ChatbotService } from './service/chatbot.service.js';
import { ChatbotRepository } from './repository/chatbot.repository.js';

const chatbotRepository = new ChatbotRepository();
const chatbotService = new ChatbotService(chatbotRepository);
const chatbotController = new ChatbotController(chatbotService);

export { chatbotController, chatbotService, chatbotRepository };