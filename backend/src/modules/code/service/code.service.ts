import { exec } from 'child_process';
import { promisify } from 'util';
import { type CodeServiceInterface } from './code.service.interface.js';
import { type CodeExecutionRequest, type CodeExecutionResult } from '../code.types.js';

const execAsync = promisify(exec);

export class CodeService implements CodeServiceInterface {
    async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
        const startTime = Date.now();

        try {
            let command: string;
            let fileExtension: string;

            switch (request.language) {
                case 'python':
                    command = `python -c "${request.code.replace(/"/g, '\\"')}"`;
                    break;
                case 'javascript':
                    command = `node -e "${request.code.replace(/"/g, '\\"')}"`;
                    break;
                case 'java':
                    // For Java, need to create a temp file, compile and run
                    // Simplified: assume code is a class with main
                    command = `echo "${request.code}" > Temp.java && javac Temp.java && java Temp`;
                    break;
                default:
                    throw new Error('Unsupported language');
            }

            const { stdout, stderr } = await execAsync(command, { timeout: 5000 }); // 5 second timeout

            const executionTime = Date.now() - startTime;

            return {
                output: stdout,
                error: stderr || undefined,
                executionTime,
            };
        } catch (error: any) {
            const executionTime = Date.now() - startTime;
            return {
                output: '',
                error: error.message,
                executionTime,
            };
        }
    }
}