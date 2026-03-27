import { type ChatSession, type ChatMessage, type CreateSessionRequest, type SendMessageRequest } from '../chatbot.types.js';

export interface ChatbotServiceInterface {
    createSession(userId: string, request: CreateSessionRequest): Promise<ChatSession>;
    getSessions(userId: string): Promise<ChatSession[]>;
    getSession(userId: string, sessionId: string): Promise<ChatSession>;
    deleteSession(userId: string, sessionId: string): Promise<void>;
    sendMessage(userId: string, sessionId: string, request: SendMessageRequest): Promise<ChatMessage>;
    getMessages(userId: string, sessionId: string): Promise<ChatMessage[]>;
}