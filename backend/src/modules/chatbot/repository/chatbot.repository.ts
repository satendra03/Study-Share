import { randomUUID } from "node:crypto";
import type { ChatMessage, ChatSession } from "../chatbot.types.js";
import type { ChatbotRepositoryInterface } from "./chatbot.repository.interface.js";

/**
 * In-memory store so the server boots without an extra DB collection.
 * Replace with Mongo/Firestore when you want persistence.
 */
export class ChatbotRepository implements ChatbotRepositoryInterface {
    private sessions = new Map<string, ChatSession>();
    private messagesBySession = new Map<string, ChatMessage[]>();

    async createSession(userId: string, title: string): Promise<ChatSession> {
        const now = new Date();
        const session: ChatSession = {
            _id: randomUUID(),
            userId,
            title,
            createdAt: now,
            updatedAt: now,
        };
        this.sessions.set(session._id!, session);
        this.messagesBySession.set(session._id!, []);
        return session;
    }

    async getSessionsByUserId(userId: string): Promise<ChatSession[]> {
        return [...this.sessions.values()]
            .filter((s) => s.userId === userId)
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }

    async getSessionById(sessionId: string): Promise<ChatSession | null> {
        return this.sessions.get(sessionId) ?? null;
    }

    async deleteSession(sessionId: string): Promise<void> {
        this.sessions.delete(sessionId);
        this.messagesBySession.delete(sessionId);
    }

    async createMessage(
        sessionId: string,
        role: "user" | "assistant",
        content: string
    ): Promise<ChatMessage> {
        const message: ChatMessage = {
            _id: randomUUID(),
            sessionId,
            role,
            content,
            createdAt: new Date(),
        };
        const list = this.messagesBySession.get(sessionId) ?? [];
        list.push(message);
        this.messagesBySession.set(sessionId, list);

        const session = this.sessions.get(sessionId);
        if (session) {
            session.updatedAt = new Date();
            this.sessions.set(sessionId, session);
        }

        return message;
    }

    async getMessagesBySessionId(sessionId: string): Promise<ChatMessage[]> {
        return [...(this.messagesBySession.get(sessionId) ?? [])].sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        );
    }
}
