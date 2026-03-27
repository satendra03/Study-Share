import { type NextFunction, type Request, type Response } from "express";
import { ApiResponse } from "@/shared/ApiResponse.js";
import { type UserServiceInterface } from "./service/user.service.interface.js";
import { BadRequestError } from "@/shared/ApiError.js";

export class UserController {
    constructor(private userService: UserServiceInterface) { }

    getPublicStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await this.userService.getPublicStats();
            res.status(200).json(stats);
        } catch (error) {
            next(error);
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.params.id as string;
            if(!userId){
                throw new BadRequestError("User ID is required");
            }
            const user = await this.userService.getUserById(userId);
            res.status(200).json(ApiResponse.success({
                message: "User fetched successfully",
                data: user
            }));
        } catch (error) {
            next(error);
        }
    }

    getByEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if(!req.body) throw new BadRequestError("Body is required");
            const {email} = req.body;
            if(!email){
                throw new BadRequestError("Email is required");
            }
            const user = await this.userService.getUserByEmail(email);
            res.status(200).json(ApiResponse.success({
                message: "User fetched successfully",
                data: user
            }));
        } catch (error) {
            next(error);
        }
    }

    getByFirebaseUid = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if(!req.body) throw new BadRequestError("Body is required");
            const {firebaseUid} = req.body;
            if(!firebaseUid){
                throw new BadRequestError("Firebase UID is required");
            }
            console.log("Firebase UID: (from controller)", firebaseUid);
            const user = await this.userService.getUserByFirebaseUid(firebaseUid);
            console.log("User: (from controller)", user);
            res.status(200).json(ApiResponse.success({
                message: "User fetched successfully",
                data: user
            }));
        } catch (error) {
            next(error);
        }
    }

    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.params.id as string;
            const updates = req.body;
            if(!userId){
                throw new BadRequestError("User ID is required");
            }
            const user = await this.userService.updateUser(userId, updates);
            res.status(200).json(ApiResponse.success({
                message: "User updated successfully",
                data: user
            }));
        } catch (error) {
            next(error);
        }
    }

    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.params.id as string;
            if(!userId){
                throw new BadRequestError("User ID is required");
            }
            await this.userService.deleteUser(userId);
            res.status(200).json(ApiResponse.success({
                message: "User deleted successfully"
            }));
        } catch (error) {
            next(error);
        }
    }

    searchUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = req.query.q as string;
            if(!query){
                throw new BadRequestError("Query is required");
            }
            const users = await this.userService.searchUsers(query);
            res.status(200).json(ApiResponse.success({
                message: "Users found",
                data: users
            }));
        } catch (error) {
            next(error);
        }
    }
    
}
