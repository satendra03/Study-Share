export interface CodeExecutionRequest {
    language: 'python' | 'javascript' | 'java';
    code: string;
    input?: string;
}

export interface CodeExecutionResult {
    output: string;
    error?: string;
    executionTime: number;
}