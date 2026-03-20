import apiClient from './config';

export interface Material {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploaderId: string;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialRequest {
  title: string;
  description?: string;
  file: File;
}

export interface CreateMaterialResponse {
  message: string;
  data: Material;
}

export interface GetMaterialsResponse {
  message: string;
  data: Material[];
}

export interface GetMaterialResponse {
  message: string;
  data: Material;
}

export const materialsApi = {
  getAll: async (): Promise<GetMaterialsResponse> => {
    const response = await apiClient.get('/materials');
    return response.data;
  },

  getById: async (id: string): Promise<GetMaterialResponse> => {
    const response = await apiClient.get(`/materials/${id}`);
    return response.data;
  },

  create: async (data: CreateMaterialRequest): Promise<CreateMaterialResponse> => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('file', data.file);

    const response = await apiClient.post('/materials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  recordDownload: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/materials/${id}/download`);
    return response.data;
  },
};