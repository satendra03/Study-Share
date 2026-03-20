import type { ChatTurn, RetrievedContext } from "../chatbot.types.js";

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
    context?: RetrievedContext[];
}): string => {
    const contextText = input.context?.length
        ? input.context
              .map((c, i) => `Context ${i + 1}:\n${typeof c.text === "string" ? c.text : JSON.stringify(c)}`)
              .join("\n\n")
        : "No external context available.";

    const historyText = input.history.length
        ? input.history.map((t) => `${t.role.toUpperCase()}: ${t.content}`).join("\n")
        : "No prior conversation.";

    return [
        "You are StudyShare Assistant.",
        "Answer the user's question clearly and helpfully.",
        "If context is provided, prefer it over guessing. If you don't know, say so.",
        "",
        "### Retrieved context",
        contextText,
        "",
        "### Conversation so far",
        historyText,
        "",
        "### User message",
        input.message,
    ].join("\n");
}