import { GoogleGenAI } from "@google/genai";
import { getStructurePrompt, getPageStructuringPrompt, getSyllabusStructuringPrompt } from "@/modules/ai/prompt.js";
import { type StructuredPaper } from "@/types/paper.types.js";

// ── Shared helpers ────────────────────────────────────────────────

// Hard failure: the account has hit its daily/monthly quota. Retrying within a
// short window won't help — switch providers instead.
const isQuotaExceeded = (error: any): boolean => {
    const msg = typeof error?.message === "string" ? error.message : JSON.stringify(error);
    return /RESOURCE_EXHAUSTED|Quota exceeded|quota metric|GenerateRequestsPer(Day|Minute)/i.test(msg);
};

// Transient: the model is overloaded / briefly rate-limited — retry with backoff.
// Explicitly excludes quota errors (which need a provider switch, not a retry).
const isTransientError = (error: any): boolean => {
    if (isQuotaExceeded(error)) return false;
    const code = error?.status ?? error?.code ?? error?.error?.code ?? 0;
    const msg = typeof error?.message === "string" ? error.message : JSON.stringify(error);
    return (
        code === 429 ||
        code === 500 ||
        code === 502 ||
        code === 503 ||
        code === 504 ||
        /UNAVAILABLE|overload|retry/i.test(msg)
    );
};

// Call Cerebras Inference (OpenAI-compatible REST endpoint).
export const callCerebras = async (
    messages: Array<{ role: string; content: string }>,
    opts?: { model?: string; temperature?: number }
): Promise<string> => {
    const apiKey = process.env.CEREBRAS_API_KEY;
    if (!apiKey) throw new Error("CEREBRAS_API_KEY not configured");
    const model = opts?.model || process.env.CEREBRAS_MODEL || "gpt-oss-120b";

    const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: opts?.temperature ?? 0.2,
        }),
    });

    if (!res.ok) {
        const bodyText = await res.text().catch(() => "");
        const err: any = new Error(`Cerebras ${res.status}: ${bodyText.slice(0, 200)}`);
        err.status = res.status;
        throw err;
    }

    const data = (await res.json()) as any;
    const text = data?.choices?.[0]?.message?.content;
    if (!text || typeof text !== "string") {
        throw new Error("Cerebras returned no content");
    }
    return text;
};

const stripJsonFences = (text: string): string =>
    text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

export type ChatTurn = { role: "user" | "assistant"; content: string };

/**
 * Generate text with Gemini primary, Cerebras fallback.
 *   - Gemini: retries transient errors (503/overload) 5× with backoff.
 *   - On Gemini quota exceeded: skip remaining retries, immediately try Cerebras.
 *   - Cerebras: up to 3 retries on its own transient errors.
 */
export const generateWithRetry = async (
    prompt: string,
    opts: {
        logPrefix: string;
        temperature?: number;
        systemInstruction?: string;
        history?: ChatTurn[];
    }
): Promise<string> => {
    const { logPrefix, temperature = 0.2, systemInstruction, history = [] } = opts;

    // Build Gemini-shaped contents
    const geminiContents = history.map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
    }));
    geminiContents.push({ role: "user", parts: [{ text: prompt }] });

    const geminiConfig: any = { temperature };
    if (systemInstruction) geminiConfig.systemInstruction = systemInstruction;

    // ── 1) Gemini 2.5-flash ───────────────────────────────────────
    const GEMINI_RETRIES = 5;
    let quotaHit = false;
    for (let attempt = 0; attempt < GEMINI_RETRIES; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: geminiContents,
                config: geminiConfig,
            });
            return response.text ?? "";
        } catch (error: any) {
            const code = error?.status ?? error?.code ?? error?.error?.code ?? 0;
            const msg = typeof error?.message === "string" ? error.message : JSON.stringify(error);

            if (isQuotaExceeded(error)) {
                console.warn(`${logPrefix} Gemini quota exceeded — switching to Cerebras immediately`);
                quotaHit = true;
                break;
            }

            if (isTransientError(error) && attempt < GEMINI_RETRIES - 1) {
                // Backoffs: 2s → 4s → 8s → 16s → capped at 30s (~60s across 5 tries)
                const delay = Math.min(30_000, 2000 * 2 ** attempt);
                console.warn(`${logPrefix} Gemini transient (attempt ${attempt + 1}/${GEMINI_RETRIES}), retrying in ${delay}ms: ${code} ${msg.slice(0, 120)}`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
            }

            console.warn(`${logPrefix} Gemini ${isTransientError(error) ? "exhausted" : "non-transient"} — trying Cerebras: ${msg.slice(0, 120)}`);
            break;
        }
    }

    // ── 2) Cerebras fallback (walk a model chain) ─────────────────
    if (!process.env.CEREBRAS_API_KEY) {
        const reason = quotaHit ? "Gemini quota exceeded" : "Gemini failed";
        throw new Error(`${logPrefix} ${reason} and CEREBRAS_API_KEY is not set`);
    }

    // OpenAI-style messages: optional system, then history, then final user
    const cerebrasMessages: Array<{ role: string; content: string }> = [];
    if (systemInstruction) cerebrasMessages.push({ role: "system", content: systemInstruction });
    for (const h of history) cerebrasMessages.push({ role: h.role, content: h.content });
    cerebrasMessages.push({ role: "user", content: prompt });

    const cbModels = (process.env.CEREBRAS_MODEL || "gpt-oss-120b")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    for (const cbModel of cbModels) {
        try {
            const text = await callCerebras(cerebrasMessages, { model: cbModel, temperature });
            console.log(`${logPrefix} ✅ Succeeded with Cerebras (${cbModel})`);
            return text;
        } catch (error: any) {
            const code = error?.status ?? 0;
            const msg = typeof error?.message === "string" ? error.message : JSON.stringify(error);

            // Model-specific issues → try next model in the chain:
            //   429 rate-limited, 503 overloaded, quota hit, 404 not enabled for this account
            if (
                isTransientError(error) ||
                isQuotaExceeded(error) ||
                code === 404 ||
                /not_found_error|model_not_found|do not have access/i.test(msg)
            ) {
                console.warn(`${logPrefix} Cerebras ${cbModel} unavailable (${code}) — trying next model: ${msg.slice(0, 100)}`);
                continue;
            }

            console.error(`${logPrefix} Cerebras ${cbModel} non-transient error:`, msg.slice(0, 200));
            // Account-level auth errors etc. — stop walking, they'll hit every model
            throw error;
        }
    }

    throw new Error(`${logPrefix} All providers exhausted`);
};

export interface SyllabusModule {
    name: string;
    title: string;
    topics: string[];
}

export interface StructuredSyllabus {
    modules: SyllabusModule[];
    courseOutcomes: string[];
    textbooks: string[];
}

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const AIService = {
    structureWithAI: async (rawText: string): Promise<StructuredPaper> => {
        const prompt = getStructurePrompt(rawText);
        try {
            const text = await generateWithRetry(prompt, { logPrefix: "[PYQ-Structuring]" });
            const parsed = JSON.parse(stripJsonFences(text)) as StructuredPaper;
            parsed.rawText = rawText;
            return parsed;
        } catch (err: any) {
            console.error("[PYQ-Structuring] All LLM providers failed — default structure");
            return {
                subject: null,
                subjectCode: null,
                branch: null,
                semester: null,
                papers: [],
                rawText,
            };
        }
    },

    structurePageWithAI: async (rawText: string, pageNumber: number, subject?: string | null): Promise<{ groups: { unit: string; questions: string[] }[] }> => {
        const prompt = getPageStructuringPrompt(rawText, pageNumber, subject);
        try {
            const text = await generateWithRetry(prompt, { logPrefix: `[Page-${pageNumber}-Structuring]` });
            const parsed = JSON.parse(stripJsonFences(text));
            const groups = Array.isArray(parsed.groups)
                ? parsed.groups.map((g: any) => ({
                    unit: g.unit || "Module-1",
                    questions: Array.isArray(g.questions) ? g.questions : []
                }))
                : [];
            return { groups };
        } catch (err: any) {
            console.error(`[Page-${pageNumber}-Structuring] All LLM providers failed — empty groups`);
            return { groups: [] };
        }
    },

    structureSyllabusWithAI: async (rawText: string, subject: string, semester: string): Promise<StructuredSyllabus> => {
        const prompt = getSyllabusStructuringPrompt(rawText, subject, semester);
        try {
            const text = await generateWithRetry(prompt, { logPrefix: "[SyllabusStructuring]" });
            const parsed = JSON.parse(stripJsonFences(text));
            const modules: SyllabusModule[] = Array.isArray(parsed.modules)
                ? parsed.modules
                    .filter((m: any) => m && typeof m.name === "string")
                    .map((m: any) => ({
                        name: String(m.name).trim() || "Module 1",
                        title: typeof m.title === "string" ? m.title.trim() : "",
                        topics: Array.isArray(m.topics)
                            ? m.topics
                                .map((t: any) => String(t).trim())
                                .filter(Boolean)
                                .slice(0, 30)
                            : [],
                    }))
                : [];

            return {
                modules,
                courseOutcomes: Array.isArray(parsed.courseOutcomes)
                    ? parsed.courseOutcomes.map((o: any) => String(o).trim()).filter(Boolean)
                    : [],
                textbooks: Array.isArray(parsed.textbooks)
                    ? parsed.textbooks.map((o: any) => String(o).trim()).filter(Boolean)
                    : [],
            };
        } catch (err: any) {
            console.error("[SyllabusStructuring] All LLM providers failed — empty structure");
            return { modules: [], courseOutcomes: [], textbooks: [] };
        }
    },
}