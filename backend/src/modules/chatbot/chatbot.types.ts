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
   * Automatically fetch context via pdfId and pageNumber.
   */
  pdfId: string;
  pageNumber: number;
}

export interface ChatWithContextResponse {
  reply: string;
}
