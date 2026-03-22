import { type AdminServiceInterface } from "./admin.service.interface.js";
import { type AdminRepositoryInterface } from "../repository/admin.repository.interface.js";
import type { AdminStats, AdminMaterialManagement, AdminUserManagement, VerifyUserResult } from "../admin.types.js";

export class AdminService implements AdminServiceInterface {
  constructor(private repository: AdminRepositoryInterface) {}

  getDashboardStats = async (): Promise<AdminStats> => {
    return await this.repository.getStats();
  }

  getAllUsers = async (
    page: number = 1,
    limit: number = 10,
  ): Promise<AdminUserManagement> => {
    return await this.repository.getUsers(page, limit);
  }

  getAllMaterials = async (
    page: number = 1,
    limit: number = 10,
  ): Promise<AdminMaterialManagement> => {
    return await this.repository.getMaterials(page, limit);
  }

  deleteMaterial = async (materialId: string): Promise<void> => {
    await this.repository.deleteMaterial(materialId);
  }

  verifyUser = async (uid: string): Promise<VerifyUserResult> => {
    return await this.repository.verifyUser(uid);
  };
}
