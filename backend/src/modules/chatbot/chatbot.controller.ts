import { type NextFunction, type Request, type Response } from 'express';
import { type ChatbotServiceInterface } from './service/chatbot.service.interface.js';
import { ApiResponse } from '@/shared/ApiResponse.js';
import { type CreateSessionRequest, type SendMessageRequest } from './chatbot.types.js';

export class ChatbotController {
    constructor(private chatbotService: ChatbotServiceInterface) {}

    /**
     * GET /api/chatbot/sessions
     * Get all sessions for the authenticated user
     */
    getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user.id; // From auth middleware
            const sessions = await this.chatbotService.getSessions(userId);
            res.json(ApiResponse.success({ message: "Sessions retrieved successfully", data: sessions }));
        } catch (error: any) {
            next(error);
        }
    };

    /**
     * POST /api/chatbot/sessions
     * Create a new chat session
     */
    createSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const request: CreateSessionRequest = req.body;
            if (!request.title) {
                res.status(400).json(ApiResponse.error('Title is required'));
                return;
            }
            const session = await this.chatbotService.createSession(userId, request);
            res.status(201).json(ApiResponse.success({ message: "Session created successfully", data: session }));
        } catch (error: any) {
            next(error);
        }
    };

    /**
     * GET /api/chatbot/sessions/:id
     * Get a specific session
     */
    getSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const sessionId = req.params.id as string;
            const session = await this.chatbotService.getSession(userId, sessionId);
            res.json(ApiResponse.success({ message: "Session retrieved successfully", data: session }));
        } catch (error: any) {
            next(error);
        }
    };

    /**
     * DELETE /api/chatbot/sessions/:id
     * Delete a session
     */
    deleteSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const sessionId = req.params.id as string;
            await this.chatbotService.deleteSession(userId, sessionId);
            res.json(ApiResponse.success({ message: 'Session deleted successfully' }));
        } catch (error: any) {
            next(error);
        }
    };

    /**
     * POST /api/chatbot/sessions/:id/messages
     * Send a message to the session
     */
    sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const sessionId = req.params.id as string;
            const request: SendMessageRequest = req.body;
            if (!request.content) {
                res.status(400).json(ApiResponse.error('Content is required'));
                return;
            }
            const message = await this.chatbotService.sendMessage(userId, sessionId, request);
            res.json(ApiResponse.success({ message: "Message sent successfully", data: message }));
        } catch (error: any) {
            next(error);
        }
    };

    /**
     * GET /api/chatbot/sessions/:id/messages
     * Get all messages for a session
     */
    getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const sessionId = req.params.id as string;
            const messages = await this.chatbotService.getMessages(userId, sessionId);
            res.json(ApiResponse.success({ message: "Messages retrieved successfully", data: messages }));
        } catch (error: any) {
            next(error);
        }
    };
}