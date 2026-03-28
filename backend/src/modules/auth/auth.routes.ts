import { Router } from "express";
import { authController } from "@/modules/auth/auth.module.js";
import { verifyFirebaseToken, requireAppUser, requireAdmin, loadProfileUser } from "@/middlewares/auth.middleware.js";

const authRouter = Router();

// ── Public routes (only need a valid Firebase token) ────────────────────────

/** Check if user exists in DB after Google sign-in */
authRouter.post("/signin", authController.signIn);

/** Complete profile — student */
authRouter.post("/register/student", authController.registerStudent);

/** Complete profile — teacher */
authRouter.post("/register/teacher", authController.registerTeacher);

// ── Protected routes (must be logged in + profile complete) ─────────────────

/** Get current user's profile (complete or incomplete, or null if no Firestore doc yet) */
authRouter.get("/me", verifyFirebaseToken, loadProfileUser, authController.getMe);

// ── Admin-only routes ────────────────────────────────────────────────────────

/** List all teachers pending verification */
authRouter.get(
    "/admin/pending",
    verifyFirebaseToken,
    requireAppUser,
    requireAdmin,
    authController.getPendingVerifications
);

/** Verify a specific teacher */
authRouter.patch(
    "/admin/verify/:userId",
    verifyFirebaseToken,
    requireAppUser,
    requireAdmin,
    authController.verifyTeacher
);

export default {
    path: "auth",
    router: authRouter,
};