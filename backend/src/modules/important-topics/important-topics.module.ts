import { ImportantTopicsService } from "./important-topics.service.js";
import { ImportantTopicsController } from "./important-topics.controller.js";

const importantTopicsService = new ImportantTopicsService();
const importantTopicsController = new ImportantTopicsController(importantTopicsService);

export { importantTopicsService, importantTopicsController };
