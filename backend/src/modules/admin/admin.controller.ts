import { type NextFunction, type Request, type Response } from 'express';
import { type AdminServiceInterface } from './service/admin.service.interface.js';
import { ApiResponse } from '@/shared/ApiResponse.js';

export class AdminController {
    constructor(private adminService: AdminServiceInterface) {}

    getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const stats = await this.adminService.getDashboardStats();
            res.json(ApiResponse.success({ message: "Dashboard stats retrieved successfully", data: stats }));
        } catch (error: any) {
            next(error);
        }
    };

    getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const users = await this.adminService.getAllUsers(page, limit);
            res.json(ApiResponse.success({ message: "Users retrieved successfully", data: users }));
        } catch (error: any) {
            next(error);
        }
    };

    getMaterials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const materials = await this.adminService.getAllMaterials(page, limit);
            res.json(ApiResponse.success({ message: "Materials retrieved successfully", data: materials }));
        } catch (error: any) {
            next(error);
        }
    };
}