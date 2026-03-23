import { type NextFunction, type Request, type Response } from "express";
import { ApiResponse } from "@/shared/ApiResponse.js";
import { type MaterialServiceInterface } from "./service/material.service.interface.js";
import { BadRequestError } from "@/shared/ApiError.js";

export class MaterialController {
    constructor(private materialService: MaterialServiceInterface) {}

    createMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.appUser) {
                res.status(401).json(ApiResponse.error("Unauthorized"));
                return;
            }

            const { year, description } = req.body;
            const file = req.file;

            if (!file) {
                throw new BadRequestError("Missing required fields: file");
            }
            if (!year) {
                throw new BadRequestError("Missing required fields: year");
            }

            const safeName = file.originalname.replace(/[^a-zA-Z0-9]/g, "_");

            const material = await this.materialService.createMaterial(
                {
                    year,
                    description: description || "",
                    fileName: safeName,
                    fileType: file.mimetype || "application/pdf",
                    fileSize: file.size,
                    uploaderId: req.appUser.firebaseUid,
                },
                file
            );

            res.status(201).json(ApiResponse.success({
                message: "Material created successfully",
                data: material
            }));
        } catch (error) {
            next(error);
        }
    }

    getAllMaterials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const materials = await this.materialService.getAllMaterials();
            res.status(200).json(ApiResponse.success({
                message: "Materials fetched successfully",
                data: materials
            }));
        } catch (error) {
            next(error);
        }
    }

    getMaterialById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const materialId = req.params["id"] as string;
            if (!materialId) throw new BadRequestError("Material ID is required");

            const material = await this.materialService.getMaterialById(materialId);
            
            res.status(200).json(ApiResponse.success({
                message: "Material fetched successfully",
                data: material
            }));
        } catch (error) {
            next(error);
        }
    }

    deleteMaterialById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const materialId = req.params["id"] as string;
            if (!materialId) throw new BadRequestError("Material ID is required");

            await this.materialService.deleteMaterial(materialId);
            
            res.status(200).json(ApiResponse.success({
                message: "Material deleted successfully",
                data: null
            }));
        } catch (error) {
            next(error);
        }
    }

    recordDownload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const materialId = req.params["id"] as string;
            if (!materialId) throw new BadRequestError("Material ID is required");

            await this.materialService.recordDownload(materialId);
            res.status(200).json(ApiResponse.success({
                message: "Download recorded successfully",
                data: null
            }));
        } catch (error) {
            next(error);
        }
    }

    searchMaterials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { q, branch, subject, semester } = req.query;
            const query = q as string;
            const filters = { branch: branch as string, subject: subject as string, semester: semester as string };

            const results = await this.materialService.search(query, filters, 10);
            res.status(200).json(ApiResponse.success({
                message: "Search completed successfully",
                data: results
            }));
        } catch (error) {
            next(error);
        }   
    }

    getProcessingStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const materialId = req.params["id"] as string;
            if (!materialId) throw new BadRequestError("Material ID is required");

            const status = await this.materialService.getProcessingStatus(materialId);
            res.status(200).json(ApiResponse.success({
                message: "Processing status fetched successfully",
                data: status
            }));
        } catch (error) {
            next(error);
        }
    }

    getMyUploads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.appUser) {
                res.status(401).json(ApiResponse.error("Unauthorized"));
                return;
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const uploads = await this.materialService.getMyUploads(req.appUser.firebaseUid, page, limit);
            res.status(200).json(ApiResponse.success({
                message: "My uploads fetched successfully",
                data: uploads
            }));
        } catch (error) {
            next(error);
        }
    }

    chatWithMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.appUser) {
                res.status(401).json(ApiResponse.error("Unauthorized"));
                return;
            }

            const materialId = req.params["id"] as string;
            const { message, history, pageNumber } = req.body;

            if (!materialId) throw new BadRequestError("Material ID is required");
            if (!message) throw new BadRequestError("Message is required");
            if (typeof pageNumber !== "number") throw new BadRequestError("pageNumber is required and must be a number");

            const response = await this.materialService.chatWithMaterial(materialId, message, history || [], pageNumber);
            res.status(200).json(ApiResponse.success({
                message: "Chat response fetched successfully",
                data: response
            }));
        } catch (error) {
            next(error);
        }
    }

    getMaterialPages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const materialId = req.params["id"] as string;
            if (!materialId) throw new BadRequestError("Material ID is required");

            const pages = await this.materialService.getMaterialPages(materialId);
            res.status(200).json(ApiResponse.success({
                message: "Material pages fetched successfully",
                data: pages
            }));
        } catch (error) {
            next(error);
        }
    }

    getMaterialPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const materialId = req.params["id"] as string;
            const pageNumber = parseInt(req.params["pageNumber"] as string);

            if (!materialId) throw new BadRequestError("Material ID is required");
            if (isNaN(pageNumber)) throw new BadRequestError("Valid pageNumber is required");

            const page = await this.materialService.getMaterialPage(materialId, pageNumber);
            res.status(200).json(ApiResponse.success({
                message: "Material page fetched successfully",
                data: page
            }));
        } catch (error) {
            next(error);
        }
    }
}
