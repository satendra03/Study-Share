import { type AdminStats, type AdminUserManagement, type AdminMaterialManagement } from '../admin.types.js';

export interface AdminServiceInterface {
    getDashboardStats(): Promise<AdminStats>;
    getAllUsers(page: number, limit: number, role?: string, verified?: string): Promise<AdminUserManagement>;
    getAllMaterials(page: number, limit: number, status?: string): Promise<AdminMaterialManagement>;
    verifyUser(userId: string, verified: boolean): Promise<any>;
    deleteUser(userId: string): Promise<void>;
    deleteMaterial(materialId: string): Promise<void>;
    createTeacher(email: string, password: string, fullName: string): Promise<any>;
}
