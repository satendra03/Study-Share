import { MaterialRepository } from "./repository/material.repository.js";
import { MaterialService } from "./service/material.service.js";
import { MaterialController } from "./material.controller.js";

const materialRepository = new MaterialRepository();
const materialService = new MaterialService(materialRepository);
const materialController = new MaterialController(materialService);

export { materialController };