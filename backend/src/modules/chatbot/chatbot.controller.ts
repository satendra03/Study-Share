import { type NextFunction, type Request, type Response } from 'express';
import { type ChatbotServiceInterface } from './service/chatbot.service.interface.js';
import { ApiResponse } from '@/shared/ApiResponse.js';
import { type ChatWithContextRequest } from "./chatbot.types.js";

export class ChatbotController {
    constructor(private chatbotService: ChatbotServiceInterface) {}

    /**
     * POST /api/chatbot/chat
     * Stateless chat endpoint. History is supplied by the client (not stored).
     */
    chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const request: ChatWithContextRequest = req.body;
            const result = await this.chatbotService.chat(request);
            res.json(ApiResponse.success({ message: "Reply generated successfully", data: result }));
        } catch (error: any) {
            next(error);
        }
    };
}