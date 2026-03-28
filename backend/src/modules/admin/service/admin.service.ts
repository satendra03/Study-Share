import { type AdminServiceInterface } from './admin.service.interface.js';
import { type AdminRepositoryInterface } from '../repository/admin.repository.interface.js';
import { type AdminStats, type AdminUserManagement, type AdminMaterialManagement } from '../admin.types.js';

export class AdminService implements AdminServiceInterface {
    constructor(private repository: AdminRepositoryInterface) {}

    async getDashboardStats(): Promise<AdminStats> {
        return await this.repository.getStats();
    }

    async getAllUsers(page: number = 1, limit: number = 10, role?: string, verified?: string): Promise<AdminUserManagement> {
        return await this.repository.getUsers(page, limit, role, verified);
    }

    async getAllMaterials(page: number = 1, limit: number = 10, status?: string): Promise<AdminMaterialManagement> {
        return await this.repository.getMaterials(page, limit, status);
    }

    async verifyUser(userId: string, verified: boolean): Promise<any> {
        return await this.repository.verifyUser(userId, verified);
    }

    async deleteUser(userId: string): Promise<void> {
        return await this.repository.deleteUser(userId);
    }

    async deleteMaterial(materialId: string): Promise<void> {
        return await this.repository.deleteMaterial(materialId);
    }

    async createTeacher(email: string, password: string, fullName: string, teacherId: string): Promise<any> {
        return await this.repository.createTeacher(email, password, fullName, teacherId);
    }
}
