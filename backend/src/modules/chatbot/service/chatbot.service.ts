import { GoogleGenAI } from "@google/genai";
import { type ChatbotServiceInterface } from "./chatbot.service.interface.js";
import { BadRequestError, InternalServerError } from "@/shared/ApiError.js";
import {
  type ChatTurn,
  type ChatWithContextRequest,
  type ChatWithContextResponse,
  type RetrievedContext,
} from "../chatbot.types.js";
import { normalizeHistory, buildPrompt } from "../utils/index.js";
import { embeddingService } from "@/modules/embeddings/embeddings.module.js";
import { ai } from "@/modules/ai/ai.service.js";

export class ChatbotService implements ChatbotServiceInterface {
  async chat(req: ChatWithContextRequest): Promise<ChatWithContextResponse> {
    const message = (req.message ?? "").trim();
    if (!message) throw new BadRequestError("Message is required");

    const pdfId = (req.pdfId ?? "").trim();
    const history = normalizeHistory(req.history ?? ([] as ChatTurn[]));

    let context: RetrievedContext[] | undefined = [];
    if (pdfId) {
      try {
        const retrieveRes = await embeddingService.retrieve({
          question: message,
          pdfId,
        });
        context = retrieveRes?.context ?? [];
      } catch (err) {
        console.error("[RAG] Context retrieval failed, answering without context:", err);
        context = [];
      }
    }

    const prompt = buildPrompt({ message, history, context });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const reply = (response.text ?? "").trim();
    if (!reply) throw new InternalServerError("Empty response from AI model");

    return { reply, context };
  }
}
