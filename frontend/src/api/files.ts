import apiClient from './config';

export interface FileItem {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
  type: string;
}

export interface FileUploadResponse {
  success: boolean;
  file: FileItem;
}

export const filesApi = {
  getFiles: async (): Promise<FileItem[]> => {
    const response = await apiClient.get('/materials');
    // Map IMaterial back to generic FileItem shape currently used by UI
    return (response.data.materials || []).map((m: any) => ({
      id: m._id,
      name: m.fileName,
      url: m.fileUrl,
      size: m.fileSize,
      uploadedAt: m.createdAt,
      type: m.fileType
    }));
  },

  uploadFile: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.split('.')[0]);
    formData.append('description', '');

    const response = await apiClient.post('/materials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const m = response.data.material;
    
    return {
      success: true,
      file: {
        id: m._id,
        name: m.fileName,
        url: m.fileUrl,
        size: m.fileSize,
        uploadedAt: m.createdAt,
        type: m.fileType
      }
    };
  },

  deleteFile: async (materialId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/materials/${materialId}`);
    return response.data;
  },

  getFile: async (materialId: string): Promise<FileItem> => {
    const response = await apiClient.get(`/materials/${materialId}`);
    const m = response.data.material;
    return {
      id: m._id,
      name: m.fileName,
      url: m.fileUrl,
      size: m.fileSize,
      uploadedAt: m.createdAt,
      type: m.fileType
    };
  },
};
