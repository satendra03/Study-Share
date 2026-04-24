import { type NextFunction, type Request, type Response } from "express";
import { ApiResponse } from "@/shared/ApiResponse.js";
import { BadRequestError } from "@/shared/ApiError.js";
import { type SemesterSubjectServiceInterface } from "./service/semester-subject.service.interface.js";

export class SemesterSubjectController {
    constructor(private service: SemesterSubjectServiceInterface) {}

    list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const semester = req.query.semester as string | undefined;
            const branch = req.query.branch as string | undefined;
            const items = await this.service.list({ semester, branch });
            res.json(
                ApiResponse.success({
                    message: "Subjects fetched successfully",
                    data: items,
                })
            );
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params["id"] as string;
            if (!id) throw new BadRequestError("Subject ID is required");
            const item = await this.service.getById(id);
            res.json(
                ApiResponse.success({
                    message: "Subject fetched successfully",
                    data: item,
                })
            );
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { semester, subject, subjectCode, branch } = req.body;
            if (!semester || !subject) {
                throw new BadRequestError("semester and subject are required");
            }
            const created = await this.service.create(
                { semester, subject, subjectCode, branch },
                req.file
            );
            res.status(201).json(
                ApiResponse.success({
                    message: "Subject created successfully",
                    data: created,
                })
            );
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params["id"] as string;
            if (!id) throw new BadRequestError("Subject ID is required");
            const { semester, subject, subjectCode, branch } = req.body;
            const updated = await this.service.update(
                id,
                { semester, subject, subjectCode, branch },
                req.file
            );
            res.json(
                ApiResponse.success({
                    message: "Subject updated successfully",
                    data: updated,
                })
            );
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params["id"] as string;
            if (!id) throw new BadRequestError("Subject ID is required");
            await this.service.delete(id);
            res.json(
                ApiResponse.success({
                    message: "Subject deleted successfully",
                    data: null,
                })
            );
        } catch (error) {
            next(error);
        }
    };
}
