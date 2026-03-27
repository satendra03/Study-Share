import { type ChatbotRepositoryInterface } from '../repository/chatbot.repository.interface.js';
import { type ChatbotServiceInterface } from './chatbot.service.interface.js';
import { type ChatSession, type ChatMessage, type CreateSessionRequest, type SendMessageRequest } from '../chatbot.types.js';
import { NotFoundError } from '@/shared/ApiError.js';

export class ChatbotService implements ChatbotServiceInterface {
    constructor(private repository: ChatbotRepositoryInterface) {}

    async createSession(userId: string, request: CreateSessionRequest): Promise<ChatSession> {
        return await this.repository.createSession(userId, request.title);
    }

    async getSessions(userId: string): Promise<ChatSession[]> {
        return await this.repository.getSessionsByUserId(userId);
    }

    async getSession(userId: string, sessionId: string): Promise<ChatSession> {
        const session = await this.repository.getSessionById(sessionId);
        if (!session || session.userId !== userId) {
            throw new NotFoundError('Session not found');
        }
        return session;
    }

    async deleteSession(userId: string, sessionId: string): Promise<void> {
        const session = await this.repository.getSessionById(sessionId);
        if (!session || session.userId !== userId) {
            throw new NotFoundError('Session not found');
        }
        await this.repository.deleteSession(sessionId);
    }

    async sendMessage(userId: string, sessionId: string, request: SendMessageRequest): Promise<ChatMessage> {
        // Verify session exists and belongs to user
        await this.getSession(userId, sessionId);

        // Save user message
        const userMessage = await this.repository.createMessage(sessionId, 'user', request.content);

        // Generate assistant response (placeholder - integrate with LLM later)
        const assistantResponse = `Thank you for your message: "${request.content}". This is a placeholder response.`;

        // Save assistant message
        const assistantMessage = await this.repository.createMessage(sessionId, 'assistant', assistantResponse);

        return assistantMessage;
    }

    async getMessages(userId: string, sessionId: string): Promise<ChatMessage[]> {
        // Verify session exists and belongs to user
        await this.getSession(userId, sessionId);

        return await this.repository.getMessagesBySessionId(sessionId);
    }
}