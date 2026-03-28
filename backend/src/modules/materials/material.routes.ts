import { Router } from "express";
import { materialController } from "@/modules/materials/material.module.js";
import { verifyFirebaseToken, requireAppUser } from "@/middlewares/auth.middleware.js";
import { upload } from "@/config/multer.config.js";
import { uploadLimiter, aiLimiter } from "@/middlewares/rateLimit.middleware.js";

const materialRouter = Router();

// Publicly readable endpoints — static paths BEFORE dynamic /:id
materialRouter.get("/", materialController.getAllMaterials);
materialRouter.get("/search", materialController.searchMaterials);

// Protected static paths BEFORE dynamic /:id
materialRouter.get("/status/:id", verifyFirebaseToken, requireAppUser, materialController.getProcessingStatus);
materialRouter.get("/user/:userId", verifyFirebaseToken, requireAppUser, materialController.getMyUploads);

// Dynamic /:id routes
materialRouter.get("/:id", materialController.getMaterialById);
materialRouter.get("/:id/pages", materialController.getMaterialPages);
materialRouter.get("/:id/pages/:pageNumber", materialController.getMaterialPage);
materialRouter.post("/:id/download", materialController.recordDownload);
materialRouter.delete("/:id", verifyFirebaseToken, requireAppUser, materialController.deleteMaterialById);
materialRouter.post("/chat/:id", verifyFirebaseToken, requireAppUser, aiLimiter, materialController.chatWithMaterial);

// Upload
materialRouter.post("/", verifyFirebaseToken, requireAppUser, uploadLimiter, upload.single("file"), materialController.createMaterial);

export const materialRoute = {
    path: "materials",
    router: materialRouter,
};
