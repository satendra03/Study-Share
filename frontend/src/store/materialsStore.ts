import { create } from 'zustand';

export interface Material {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploaderId: string;
  downloads: number;
  createdAt: string;
}

interface MaterialsState {
  materials: Material[];
  isLoading: boolean;
  error: string | null;
  fetchMaterials: () => Promise<void>;
  addMaterial: (material: Material) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useMaterialsStore = create<MaterialsState>((set) => ({
  materials: [],
  isLoading: false,
  error: null,
  
  fetchMaterials: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/materials`);
      if (!res.ok) throw new Error('Failed to fetch materials');
      const data = await res.json();
      set({ materials: data.materials, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  
  addMaterial: (material: Material) => {
    set((state) => ({ materials: [material, ...state.materials] }));
  }
}));
