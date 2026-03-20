export type ChatRole = "user" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export interface ChatWithContextRequest {
  message: string;
  /**
   * Client-supplied history (not stored server-side).
   * Keep this short (e.g. last 6 turns) to control token usage.
   */
  history?: ChatTurn[];
  /**
   * When provided, the backend will retrieve relevant context from the embedding service
   * for this specific material (pdfId == materialId in Mongo).
   */
  pdfId: string;
  pageNumber?: number;
}

export interface ChatWithContextResponse {
  reply: string;
  context?: RetrievedContext[];
}

export interface RetrievedContext {
  text: string;
  score?: number;
  unit?: string;
  year?: string;
}
