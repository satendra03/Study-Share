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
        groups: { unit: string; questions: string[] }[];
        subject?: string | null;
    };
}): string => {
    const subjectLine = input.context.subject ? `Subject: ${input.context.subject}` : "";
    const contextText = input.context.groups?.length
        ? [
            subjectLine,
            `Page ${input.context.pageNumber} questions:`,
            "",
            ...input.context.groups.map(g =>
                `${g.unit}:\n${g.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
            )
          ].filter(Boolean).join("\n")
        : "No questions found on this page.";

    const historyText = input.history.length
        ? input.history.map((t) => `${t.role.toUpperCase()}: ${t.content}`).join("\n")
        : "No prior conversation.";

    return [
        "You are StudyShare Assistant, a knowledgeable academic tutor.",
        "",
        "RESPONSE LENGTH:",
        "- By default, keep answers concise and to the point (3-6 sentences or a short list).",
        "- Only give a long, detailed answer if the student explicitly asks for it (e.g. 'explain in detail', 'give a long answer', 'explain thoroughly').",
        "",
        "CONTEXT INSTRUCTIONS:",
        "- The context below is extracted from the student's uploaded exam paper / study material.",
        "- It contains the subject name, module/unit, and the exact exam questions from the current page.",
        "- Use the context to identify which question the student is referring to.",
        "- Answer that question using your own knowledge.",
        "- Do NOT say 'the document does not contain answers'. The document has the question — you provide the answer.",
        "- If a question text has a minor OCR error (e.g. garbled word), use the subject and module context to infer the correct meaning and still answer it.",
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
        "### Your answer:",
    ].join("\n");
}