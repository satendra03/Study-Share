import { GoogleGenAI } from "@google/genai";
import { getStructurePrompt, getPageStructuringPrompt } from "@/modules/ai/prompt.js";
import { type StructuredPaper } from "@/types/paper.types.js";

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const AIService = {
    structureWithAI: async (rawText: string): Promise<StructuredPaper> => {
        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                const prompt = getStructurePrompt(rawText);
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: [{
                        role: "user",
                        parts: [{ text: prompt }],
                    }],
                });

                const responseText = response.text ?? "";

                const cleaned = responseText
                    .replace(/^```json\s*/i, "")
                    .replace(/^```\s*/i, "")
                    .replace(/```\s*$/i, "")
                    .trim();

                const parsed = JSON.parse(cleaned) as StructuredPaper;
                parsed.rawText = rawText;
                return parsed;
            } catch (error: any) {
                if (error.status === 503 && attempt < maxRetries - 1) {
                    console.warn(`AI API unavailable (attempt ${attempt + 1}/${maxRetries}), retrying in ${2 ** attempt} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * (2 ** attempt))); // Exponential backoff
                    attempt++;
                } else {
                    console.error("AI API error:", error.message || error);
                    break;
                }
            }
        }

        // Fallback on failure
        console.error("Failed to structure paper after retries, returning default structure.");
        return {
            subject: null,
            subjectCode: null,
            branch: null,
            semester: null,
            papers: [],
            rawText,
        };
    },

    structurePageWithAI: async (rawText: string, pageNumber: number): Promise<{ unit: string; questions: string[] }> => {
        const maxRetries = 3;
        let attempt = 0;
        const prompt = getPageStructuringPrompt(rawText, pageNumber);

        while (attempt < maxRetries) {
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: [{
                        role: "user",
                        parts: [{ text: prompt }],
                    }],
                });

                const responseText = response.text ?? "";
                const cleaned = responseText
                    .replace(/^```json\s*/i, "")
                    .replace(/^```\s*/i, "")
                    .replace(/```\s*$/i, "")
                    .trim();

                const parsed = JSON.parse(cleaned);
                return {
                    unit: parsed.unit || "",
                    questions: Array.isArray(parsed.questions) ? parsed.questions : []
                };
            } catch (error: any) {
                if (error.status === 503 && attempt < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (2 ** attempt)));
                    attempt++;
                } else {
                    console.error(`Page AI structure error (Page ${pageNumber}):`, error.message || error);
                    break;
                }
            }
        }
        
        return { unit: "", questions: [] };
    }
}