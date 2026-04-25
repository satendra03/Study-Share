import { Router } from "express";
import { importantTopicsController } from "./important-topics.module.js";
import { verifyFirebaseToken, requireAppUser } from "@/middlewares/auth.middleware.js";

const router = Router();

router.use(verifyFirebaseToken);
router.use(requireAppUser);

router.post("/extract", importantTopicsController.extract);
router.post("/extract-modulewise", importantTopicsController.extractModuleWise);
router.post("/mindmap", importantTopicsController.mindmap);
router.post("/answer", importantTopicsController.answer);

export default {
    path: "important-topics",
    router,
};
