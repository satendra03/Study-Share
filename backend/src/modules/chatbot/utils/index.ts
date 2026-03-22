import type { ChatTurn } from "../chatbot.types.js";

export const normalizeHistory = (history: ChatTurn[]): ChatTurn[] => {
    if (!history?.length) {
        return [];
    }
    return history
        .filter((t) => (t.role === "user" || t.role === "assistant") && typeof t.content === "string")
        .slice(-6);
}

export const buildPrompt = (input: {
    message: string;
    history: ChatTurn[];
    context: {
        pageNumber: number;
        unit?: string;
        questions: string[];
    };
}): string => {
    const contextText = input.context.questions?.length
        ? `Unit/Section: ${input.context.unit || "N/A"}\nQuestions on this page:\n${input.context.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
        : "No questions found on this page.";

    const historyText = input.history.length
        ? input.history.map((t) => `${t.role.toUpperCase()}: ${t.content}`).join("\n")
        : "No prior conversation.";

    return [
        "You are StudyShare Assistant, a knowledgeable academic tutor.",
        "",
        "CONTEXT INSTRUCTIONS:",
        "- The context below is extracted from the student's uploaded exam paper / study material.",
        "- It contains exam questions organised by module and year.",
        "- Use the context to find the question the student is asking about.",
        "- Then write a COMPLETE answer to that question using your knowledge.",
        "- Structure your answer with headings, bullet points, and examples where helpful.",
        "- Do NOT say 'the document does not contain answers'. The document has the question — you provide the answer.",
        "- If no matching context is found, still answer the question from your knowledge.",
        "",
        "### Retrieved context from student's PDF",
        contextText,
        "",
        "### Conversation history",
        historyText,
        "",
        "### Student's question",
        input.message,
        "",
        "### Your answer (be thorough and educational):",
    ].join("\n");
}