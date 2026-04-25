import { type AdminServiceInterface } from './admin.service.interface.js';
import { type AdminRepositoryInterface } from '../repository/admin.repository.interface.js';
import { type AdminStats, type AdminUserManagement, type AdminMaterialManagement } from '../admin.types.js';
import { MaterialModel } from '@/modules/materials/material.model.js';
import { materialQueue } from '@/infrastructure/queue/material.queue.js';
import { NotFoundError, BadRequestError } from '@/shared/ApiError.js';

export class AdminService implements AdminServiceInterface {
    constructor(private repository: AdminRepositoryInterface) {}

    async getDashboardStats(): Promise<AdminStats> {
        return await this.repository.getStats();
    }

    async getAllUsers(page: number = 1, limit: number = 10, role?: string, verified?: string): Promise<AdminUserManagement> {
        return await this.repository.getUsers(page, limit, role, verified);
    }

    async getAllMaterials(page: number = 1, limit: number = 10, status?: string, fileType?: string): Promise<AdminMaterialManagement> {
        return await this.repository.getMaterials(page, limit, status, fileType);
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

    async reprocessMaterial(materialId: string): Promise<any> {
        const material = await MaterialModel.findById(materialId).lean();
        if (!material) throw new NotFoundError("Material not found");
        if (!material.fileUrl) throw new BadRequestError("Material has no fileUrl to process");

        // Reset processing state so frontend sees status=processing again
        await MaterialModel.findByIdAndUpdate(materialId, {
            status: "processing",
            pages: [],
            structuredData: null,
            updatedAt: new Date(),
        });

        await materialQueue.add(
            "process-material",
            { materialId, fileUrl: material.fileUrl },
            {
                attempts: 3,
                backoff: { type: "exponential", delay: 3000 },
                removeOnComplete: true,
                removeOnFail: false,
            }
        );
        console.log(`[AdminService] Re-enqueued material processing for ${materialId}`);

        return { _id: materialId, status: "processing" };
    }

    async createTeacher(email: string, password: string, fullName: string): Promise<any> {
        return await this.repository.createTeacher(email, password, fullName);
    }
}
