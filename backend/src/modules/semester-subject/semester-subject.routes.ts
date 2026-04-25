import { Router } from "express";
import { semesterSubjectController } from "./semester-subject.module.js";
import {
    verifyFirebaseToken,
    requireAppUser,
    requireAdmin,
} from "@/middlewares/auth.middleware.js";
import { upload } from "@/config/multer.config.js";

const router = Router();

// All routes require an authenticated app user
router.use(verifyFirebaseToken);
router.use(requireAppUser);

// Public-read (any logged-in user can fetch subjects + details)
router.get("/", semesterSubjectController.list);
router.get("/:id", semesterSubjectController.getById);

// Admin-only mutations (with optional syllabus PDF upload)
router.post("/", requireAdmin, upload.single("syllabus"), semesterSubjectController.create);
router.put("/:id", requireAdmin, upload.single("syllabus"), semesterSubjectController.update);
router.post("/:id/reprocess", requireAdmin, semesterSubjectController.reprocess);
router.delete("/:id", requireAdmin, semesterSubjectController.delete);

export default {
    path: "semester-subjects",
    router,
};
