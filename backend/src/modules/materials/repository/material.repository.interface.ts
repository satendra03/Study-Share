import type { Material } from "../material.types.js";

export interface MaterialRepositoryInterface {
    create(data: Omit<Material, "_id" | "createdAt" | "updatedAt" | "downloads">): Promise<Material>;
    findAll(filters?: { branch?: string; subject?: string; semester?: string; year?: string; fileType?: string }): Promise<Material[]>;
    findExistingPyq(semester: string, subject: string, year: string): Promise<Material | null>;
    findById(id: string): Promise<Material | null>;
    delete(id: string): Promise<void>;
    incrementDownload(id: string): Promise<void>;
    findByIds(ids: string[]): Promise<Material[]>;
    findByFilters(filters: { branch?: string; subject?: string; semester?: string }, limit: number): Promise<Material[]>;
    findByUploaderPaginated(uid: string, page: number, limit: number): Promise<{ materials: Material[]; total: number; page: number; limit: number }>;
    searchFullText(text: string, filters: { branch?: string; subject?: string; semester?: string; year?: string }, limit: number): Promise<Material[]>;
    update(id: string, data: Partial<Material>): Promise<Material | null>;
}