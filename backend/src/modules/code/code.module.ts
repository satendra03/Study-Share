import { CodeController } from './code.controller.js';
import { CodeService } from './service/code.service.js';

const codeService = new CodeService();
const codeController = new CodeController(codeService);

export { codeController, codeService };