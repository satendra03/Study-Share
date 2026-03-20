import { type ChatWithContextRequest, type ChatWithContextResponse } from "../chatbot.types.js";

export interface ChatbotServiceInterface {
    chat(req: ChatWithContextRequest): Promise<ChatWithContextResponse>;
}