import { type AdminStats, type  AdminUserManagement, type AdminMaterialManagement } from '../admin.types.js';

export interface AdminRepositoryInterface {
    getStats(): Promise<AdminStats>;
    getUsers(page: number, limit: number): Promise<AdminUserManagement>;
    getMaterials(page: number, limit: number): Promise<AdminMaterialManagement>;
    deleteMaterial(materialId: string): Promise<void>;
    verifyUser(uid: string): Promise<{ uid: string; isVerified: boolean }>;
}