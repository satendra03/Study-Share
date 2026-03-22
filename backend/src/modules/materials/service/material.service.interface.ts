import { type Material, type PageData } from "../material.types.js";

export interface MaterialServiceInterface {
    createMaterial(data: Omit<Material, "id" | "createdAt" | "updatedAt" | "downloads" | "fileUrl">, file: Express.Multer.File): Promise<Material>;
    getAllMaterials(): Promise<Material[]>;
    getMaterialById(id: string): Promise<Material>;
    deleteMaterial(id: string): Promise<void>;
    recordDownload(id: string): Promise<void>;
    search(query: string, filters: { branch?: string; subject?: string; semester?: string }, limit: number): Promise<Material[]>;
    getProcessingStatus(id: string): Promise<{ status: string; title: string; subject?: string; subjectCode?: string; branch?: string; semester?: string }>;
    getMyUploads(uid: string, page: number, limit: number): Promise<{ materials: Material[]; total: number; page: number; limit: number }>;
    getMaterialPages(id: string): Promise<PageData[]>;
    getMaterialPage(id: string, pageNumber: number): Promise<PageData>;
    chatWithMaterial(id: string, message: string, history: { role: string; content: string }[], pageNumber: number): Promise<{ reply: string; history: { role: string; content: string }[] }>;
}