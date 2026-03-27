import { type AdminStats, type AdminUserManagement, type AdminMaterialManagement } from '../admin.types.js';

export interface AdminServiceInterface {
    getDashboardStats(): Promise<AdminStats>;
    getAllUsers(page: number, limit: number): Promise<AdminUserManagement>;
    getAllMaterials(page: number, limit: number): Promise<AdminMaterialManagement>;
}