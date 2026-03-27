import { type Material, type PageData } from "../material.types.js";

export interface MaterialServiceInterface {
    createMaterial(data: Omit<Material, "id" | "createdAt" | "updatedAt" | "downloads" | "fileUrl" | "title">, file: Express.Multer.File): Promise<Material>;
    getAllMaterials(filters?: { branch?: string; subject?: string; semester?: string; year?: string }): Promise<Material[]>;
    getMaterialById(id: string): Promise<Material>;
    deleteMaterial(id: string): Promise<void>;
    recordDownload(id: string): Promise<void>;
    search(query: string, filters: { branch?: string; subject?: string; semester?: string; year?: string }, limit: number): Promise<Material[]>;
    getProcessingStatus(id: string): Promise<{ status: string; year: string; subject?: string; subjectCode?: string; branch?: string; semester?: string }>;
    getMyUploads(uid: string, page: number, limit: number): Promise<{ materials: Material[]; total: number; page: number; limit: number }>;
    getMaterialPages(id: string): Promise<PageData[]>;
    getMaterialPage(id: string, pageNumber: number): Promise<PageData>;
    chatWithMaterial(id: string, message: string, history: { role: string; content: string }[], pageNumber: number): Promise<{ reply: string; history: { role: string; content: string }[] }>;
    /** Batch fetch for bookmarks / lists without throwing when some ids are stale. */
    findMaterialsByIds(ids: string[]): Promise<Material[]>;
    /** Lookup without throwing (e.g. validate bookmark target exists). */
    findMaterialByIdOrNull(id: string): Promise<Material | null>;
}