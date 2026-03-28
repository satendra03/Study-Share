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
            const limit = parseInt(req.query.limit as string) || 20;
            const role = req.query.role as string | undefined;
            const verified = req.query.verified as string | undefined;
            const users = await this.adminService.getAllUsers(page, limit, role, verified);
            res.json(ApiResponse.success({ message: "Users retrieved successfully", data: users }));
        } catch (error: any) {
            next(error);
        }
    };

    getMaterials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const status = req.query.status as string | undefined;
            const materials = await this.adminService.getAllMaterials(page, limit, status);
            res.json(ApiResponse.success({ message: "Materials retrieved successfully", data: materials }));
        } catch (error: any) {
            next(error);
        }
    };

    verifyUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.params['userId'] as string;
            const { verified } = req.body;
            if (typeof verified !== 'boolean') {
                res.status(400).json(ApiResponse.error("verified (boolean) is required"));
                return;
            }
            const user = await this.adminService.verifyUser(userId, verified);
            res.json(ApiResponse.success({ message: `User ${verified ? 'verified' : 'unverified'} successfully`, data: user }));
        } catch (error: any) {
            next(error);
        }
    };

    deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.params['userId'] as string;
            if (req.appUser?.firebaseUid === userId || req.appUser?.id === userId) {
                res.status(400).json(ApiResponse.error("Cannot delete your own account"));
                return;
            }
            await this.adminService.deleteUser(userId);
            res.json(ApiResponse.success({ message: "User deleted successfully", data: null }));
        } catch (error: any) {
            next(error);
        }
    };

    deleteMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const materialId = req.params['materialId'] as string;
            await this.adminService.deleteMaterial(materialId);
            res.json(ApiResponse.success({ message: "Material deleted successfully", data: null }));
        } catch (error: any) {
            next(error);
        }
    };

    createTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password, fullName } = req.body;
            if (!email || !password || !fullName) {
                res.status(400).json(ApiResponse.error("email, password and fullName are required"));
                return;
            }
            if (password.length < 6) {
                res.status(400).json(ApiResponse.error("Password must be at least 6 characters"));
                return;
            }
            const teacher = await this.adminService.createTeacher(email, password, fullName);
            res.status(201).json(ApiResponse.success({ message: "Teacher created successfully", data: teacher }));
        } catch (error: any) {
            next(error);
        }
    };
}
