export interface ChatSession {
    _id?: string;
    userId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatMessage {
    _id?: string;
    sessionId: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Date;
}

export interface CreateSessionRequest {
    title: string;
}

export interface SendMessageRequest {
    content: string;
}

export interface ChatbotResponse {
    session?: ChatSession;
    message?: ChatMessage;
    sessions?: ChatSession[];
}