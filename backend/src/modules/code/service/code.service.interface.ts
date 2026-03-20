import { type CodeExecutionRequest, type CodeExecutionResult } from '../code.types.js';

export interface CodeServiceInterface {
    executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult>;
}