import axios from "axios";
import { InternalServerError } from "@/shared/ApiError.js";
import type { RetrievedContext } from "@/modules/chatbot/chatbot.types.js";

export type QdrantSearchResult = {
  pdfId: string;
  similarity: number;
};

export type EmbeddingRetrieveResponse = {
  status: "success";
  context: RetrievedContext[];
};

export class EmbeddingService {
  private get baseUrl(): string {
    const url = process.env.EMBEDDING_SERVER_URL;
    if (!url) throw new InternalServerError("EMBEDDING_SERVER_URL is not configured");
    return url;
  }

  search = async (params: {
    query: string;
    filters: { branch?: string; subject?: string; semester?: string };
    limit: number;
  }): Promise<QdrantSearchResult[]> => {
    const res = await axios.post<QdrantSearchResult[]>(`${this.baseUrl}/search`, params);
    return res.data;
  };

  retrieve = async (params: {
    question: string;
    pdfId: string;
    pageNumber?: number | null;
  }): Promise<EmbeddingRetrieveResponse> => {
    const res = await axios.post<EmbeddingRetrieveResponse>(`${this.baseUrl}/retrieve`, params);
    return res.data;
  };

  /**
   * Sends extracted/structured content to the embedding service for indexing.
   * Payload shape is intentionally flexible because the Python service may evolve.
   */
  processPage = async (payload: Record<string, unknown>): Promise<Record<string, unknown>> => {
    const res = await axios.post<Record<string, unknown>>(`${this.baseUrl}/process-page`, payload);
    return res.data;
  };

  deleteByPdfId = async (pdfId: string): Promise<void> => {
    try {
      await axios.delete(`${this.baseUrl}/delete/${pdfId}`);
    } catch (error) {
      console.error(`Failed to delete embeddings for pdfId ${pdfId}:`, error);
    }
  };
}

