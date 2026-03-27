import { type AdminServiceInterface } from './admin.service.interface.js';
import { type AdminRepositoryInterface } from '../repository/admin.repository.interface.js';
import { type AdminStats, type AdminUserManagement, type AdminMaterialManagement } from '../admin.types.js';

export class AdminService implements AdminServiceInterface {
    constructor(private repository: AdminRepositoryInterface) {}

    async getDashboardStats(): Promise<AdminStats> {
        return await this.repository.getStats();
    }

    async getAllUsers(page: number = 1, limit: number = 10): Promise<AdminUserManagement> {
        return await this.repository.getUsers(page, limit);
    }

    async getAllMaterials(page: number = 1, limit: number = 10): Promise<AdminMaterialManagement> {
        return await this.repository.getMaterials(page, limit);
    }
}