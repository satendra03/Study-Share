import { Router } from "express";
import { materialController } from "@/modules/materials/material.module.js";
import { verifyFirebaseToken, requireAppUser } from "@/middlewares/auth.middleware.js";
import { upload } from "@/config/multer.config.js";

const materialRouter = Router();

// Publicly readable endpoints
materialRouter.get("/", materialController.getAllMaterials);
materialRouter.get("/:materialId", materialController.getMaterialById);
materialRouter.post("/:materialId/download", materialController.recordDownload);
materialRouter.get("/search", materialController.searchMaterials);

// Protected endpoints (needs fully logged in app user)
materialRouter.post("/", verifyFirebaseToken, requireAppUser, upload.single("file"), materialController.createMaterial);
materialRouter.delete("/:materialId", verifyFirebaseToken, requireAppUser, materialController.deleteMaterialById);
materialRouter.get("/status/:materialId", verifyFirebaseToken, requireAppUser, materialController.getProcessingStatus);
materialRouter.get("/user/:userId", verifyFirebaseToken, requireAppUser, materialController.getMyUploads);
materialRouter.post("/chat/:materialId", verifyFirebaseToken, requireAppUser, materialController.chatWithMaterial);

export const materialRoute = {
    path: "materials",
    router: materialRouter,
};