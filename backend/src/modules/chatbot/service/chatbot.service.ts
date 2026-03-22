import { type ChatbotServiceInterface } from "./chatbot.service.interface.js";
import { BadRequestError, InternalServerError } from "@/shared/ApiError.js";
import {
  type ChatTurn,
  type ChatWithContextRequest,
  type ChatWithContextResponse,
} from "../chatbot.types.js";
import { normalizeHistory, buildPrompt } from "../utils/index.js";
import { ai } from "@/modules/ai/ai.service.js";
import { MaterialModel } from "@/modules/materials/material.model.js";

export class ChatbotService implements ChatbotServiceInterface {
  async chat(req: ChatWithContextRequest): Promise<ChatWithContextResponse> {
    const message = (req.message ?? "").trim();
    if (!message) throw new BadRequestError("Message is required");

    if (!req.pdfId || typeof req.pageNumber !== "number") {
      throw new BadRequestError("Valid pdfId and pageNumber are required");
    }

    const material = await MaterialModel.findById(req.pdfId).lean();
    if (!material) {
      throw new BadRequestError("Material not found");
    }

    const page = material.pages?.find((p: any) => p.pageNumber === req.pageNumber);
    const contextQuestions = page?.structured?.questions || [];
    const contextUnit = page?.structured?.unit || "";

    const context = {
      pageNumber: req.pageNumber,
      unit: contextUnit,
      questions: contextQuestions,
    };

    const history = normalizeHistory(req.history ?? ([] as ChatTurn[]));

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

    return { reply };
  }
}
