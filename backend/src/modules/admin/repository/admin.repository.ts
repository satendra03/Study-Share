import { type AdminRepositoryInterface } from './admin.repository.interface.js';
import { type AdminStats, type AdminUserManagement, type AdminMaterialManagement } from '../admin.types.js';
import { type UserServiceInterface } from '@/modules/user/service/user.service.interface.js';
import { type MaterialServiceInterface } from '@/modules/materials/service/material.service.interface.js';

export class AdminRepository implements AdminRepositoryInterface {
    constructor(
        private userService: UserServiceInterface,
        private materialService: MaterialServiceInterface,
    ) {}
    async getStats(): Promise<AdminStats> {
        try {
            // ✅ Users stats from UserService (not Firebase directly)
            const allUsers = await this.userService.searchUsers('');
            const totalUsers = allUsers.length;
            const unverifiedTeachers = (await this.userService.findUnverifiedTeachers()).length;

            // ✅ Materials stats from MaterialService (not MongoDB directly)
            const allMaterials = await this.materialService.getAllMaterials();
            const totalMaterials = allMaterials.length;
            const totalDownloads = allMaterials.reduce((sum, m) => sum + (m.downloads || 0), 0);

            console.log('✅ Admin stats fetched from services');
            return {
                totalUsers,
                totalMaterials,
                unverifiedTeachers,
                totalDownloads,
            };
        } catch (error) {
            console.error('❌ Error fetching admin stats:', error);
            throw error;
        }
    }

    async getUsers(page: number, limit: number): Promise<AdminUserManagement> {
        try {
            const offset = (page - 1) * limit;
            const allUsers = await this.userService.searchUsers('');
            const paginatedUsers = allUsers.slice(offset, offset + limit);
            const total = allUsers.length;
            
            console.log(`✅ Retrieved ${paginatedUsers.length} users for page ${page}`);
            return { users: paginatedUsers, total };
        } catch (error) {
            console.error('❌ Error fetching users:', error);
            throw error;
        }
    }

    async getMaterials(page: number, limit: number): Promise<AdminMaterialManagement> {
        try {
            const offset = (page - 1) * limit;
            const materials = await this.materialService.getAllMaterials();
            const paginatedMaterials = materials.slice(offset, offset + limit);
            const total = materials.length;
            console.log(`✅ Retrieved ${paginatedMaterials.length} materials for page ${page}`);
            return { materials: paginatedMaterials, total };
        } catch (error) {
            console.error('❌ Error fetching materials:', error);
            throw error;
        }
    }

    async deleteMaterial(materialId: string): Promise<void> {
        await this.materialService.deleteMaterial(materialId);
    }

    async verifyUser(uid: string): Promise<{ uid: string; isVerified: boolean }> {
        const user = await this.userService.verifyUser(uid);
        if (!user) throw new Error("User not found");
        return { uid, isVerified: true };
    }
}
