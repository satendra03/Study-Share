import type { ChatMessage, ChatSession } from "../chatbot.types.js";

export interface ChatbotRepositoryInterface {
    createSession(userId: string, title: string): Promise<ChatSession>;
    getSessionsByUserId(userId: string): Promise<ChatSession[]>;
    getSessionById(sessionId: string): Promise<ChatSession | null>;
    deleteSession(sessionId: string): Promise<void>;
    createMessage(sessionId: string, role: "user" | "assistant", content: string): Promise<ChatMessage>;
    getMessagesBySessionId(sessionId: string): Promise<ChatMessage[]>;
}
