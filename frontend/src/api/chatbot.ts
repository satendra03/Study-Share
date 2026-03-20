import apiClient from './config';

export interface ChatMessage {
  _id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatSession {
  _id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  title: string;
}

export interface SendMessageRequest {
  content: string;
}

export const chatbotApi = {
  getSessions: async (): Promise<{ sessions: ChatSession[] }> => {
    const response = await apiClient.get('/chatbot/sessions');
    return response.data;
  },

  createSession: async (data: CreateSessionRequest): Promise<{ session: ChatSession }> => {
    const response = await apiClient.post('/chatbot/sessions', data);
    return response.data;
  },

  getSession: async (sessionId: string): Promise<{ session: ChatSession }> => {
    const response = await apiClient.get(`/chatbot/sessions/${sessionId}`);
    return response.data;
  },

  sendMessage: async (sessionId: string, data: SendMessageRequest): Promise<{ message: ChatMessage }> => {
    const response = await apiClient.post(`/chatbot/sessions/${sessionId}/messages`, data);
    return response.data;
  },

  getMessages: async (sessionId: string): Promise<{ messages: ChatMessage[] }> => {
    const response = await apiClient.get(`/chatbot/sessions/${sessionId}/messages`);
    return response.data;
  },

  deleteSession: async (sessionId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/chatbot/sessions/${sessionId}`);
    return response.data;
  },
};
