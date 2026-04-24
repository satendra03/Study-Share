import { type NextFunction, type Request, type Response } from "express";
import { ApiResponse } from "@/shared/ApiResponse.js";
import { BadRequestError } from "@/shared/ApiError.js";
import { ImportantTopicsService } from "./important-topics.service.js";

export class ImportantTopicsController {
    constructor(private service: ImportantTopicsService) {}

    extract = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { semester, subject } = req.body;
            if (!semester || !subject) {
                throw new BadRequestError("semester and subject are required");
            }
            const result = await this.service.extract(String(semester), String(subject));
            res.json(
                ApiResponse.success({
                    message: "Important topics generated successfully",
                    data: result,
                })
            );
        } catch (error) {
            next(error);
        }
    };

    answer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { topic, semester, subject } = req.body;
            if (!topic || !semester || !subject) {
                throw new BadRequestError("topic, semester and subject are required");
            }
            const result = await this.service.answer(
                String(topic),
                String(semester),
                String(subject)
            );
            res.json(
                ApiResponse.success({
                    message: "Topic answer generated successfully",
                    data: result,
                })
            );
        } catch (error) {
            next(error);
        }
    };
}
