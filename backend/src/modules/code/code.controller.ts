import { type NextFunction, type Request, type Response } from 'express';
import { type CodeServiceInterface } from './service/code.service.interface.js';
import { ApiResponse } from '@/shared/ApiResponse.js';
import { type CodeExecutionRequest } from './code.types.js';

export class CodeController {
    constructor(private codeService: CodeServiceInterface) {}

    execute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const request: CodeExecutionRequest = req.body;
            if (!request.language || !request.code) {
                res.status(400).json(ApiResponse.error('Language and code are required'));
                return;
            }
            const result = await this.codeService.executeCode(request);
            res.json(ApiResponse.success({ message: "Code executed successfully", data: result }));
        } catch (error: any) {
            next(error);
        }
    };
}