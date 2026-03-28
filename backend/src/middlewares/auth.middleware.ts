import { type Request, type Response, type NextFunction } from "express";
import { auth } from "../config/firebase.config.js";
import { userService } from "@/modules/user/user.module.js";
import { type User } from "../modules/user/user.model.js";
import { AuthCodes } from "@/types/index.js";

// Extend Express Request to carry the verified user
declare global {
    namespace Express {
        interface Request {
            firebaseUid?: string;
            appUser?: User;
            /** Loaded by loadProfileUser: DB user if any, including incomplete profiles */
            profileUser?: User | null;
        }
    }
}

/**
 * Middleware: verify Firebase ID token from Authorization header.
 * Attaches `req.firebaseUid` on success.
 */
export async function verifyFirebaseToken(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Missing or invalid Authorization header" });
        return;
    }

    const idToken = authHeader.split("Bearer ")[1]!;

    try {
        const decoded = await auth.verifyIdToken(idToken);
        req.firebaseUid = decoded.uid;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Invalid or expired Firebase token" });
    }
}

/**
 * Middleware: requires a fully registered and active app user.
 * Attaches `req.appUser`. Use after `verifyFirebaseToken`.
 */
/**
 * After verifyFirebaseToken: attach Firestore user if a document exists (any completion state).
 * Used for GET /auth/me so the client can route to complete-profile when needed.
 */
export async function loadProfileUser(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    if (!req.firebaseUid) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const user = await userService.getUserByFirebaseUidOrNull(req.firebaseUid);
        req.profileUser = user ?? null;
    } catch {
        req.profileUser = null;
    }
    next();
}

export async function requireAppUser(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    if (!req.firebaseUid) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const user = await userService.getUserByFirebaseUidOrNull(req.firebaseUid);

        if (!user) {
            res.status(403).json({ message: "Profile incomplete", code: AuthCodes.PROFILE_INCOMPLETE });
            return;
        }

        if (user.role !== "admin" && !user.isProfileComplete) {
            res.status(403).json({ message: "Profile incomplete", code: AuthCodes.PROFILE_INCOMPLETE });
            return;
        }

        req.appUser = user;
        next();
    } catch {
        res.status(500).json({ message: "Failed to load user profile" });
    }
}

/**
 * Middleware: requires the app user to be admin-verified.
 * Students are auto-verified. Teachers need admin approval.
 */
export function requireVerified(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (!req.appUser?.isVerified) {
        res.status(403).json({
            message: "Your account is pending verification by an admin.",
            code: AuthCodes.NOT_VERIFIED,
        });
        return;
    }
    next();
}

/**
 * Middleware: admins or teachers can access this route.
 */
export function requireAdminOrTeacher(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (req.appUser?.role !== "admin" && req.appUser?.role !== "teacher") {
        res.status(403).json({ message: "Access restricted to admin or teacher" });
        return;
    }
    next();
}

/**
 * Middleware: only admins can access this route.
 */
export function requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (req.appUser?.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return;
    }
    next();
}

/**
 * Middleware for admin-only routes.
 * Verifies the Firebase token and checks the email against ADMIN_EMAIL env var.
 * Does NOT do any Firestore lookup — admin lives in Firebase Auth only.
 */
export async function requireAdminToken(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Missing Authorization header" });
        return;
    }
    const idToken = authHeader.split("Bearer ")[1]!;
    try {
        const decoded = await auth.verifyIdToken(idToken);
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
        if (!adminEmail) {
            res.status(500).json({ message: "ADMIN_EMAIL not configured on server" });
            return;
        }
        if (decoded.email?.toLowerCase().trim() !== adminEmail) {
            res.status(403).json({ message: "Admin access required" });
            return;
        }
        req.appUser = {
            id: decoded.uid,
            firebaseUid: decoded.uid,
            email: decoded.email || "",
            role: "admin",
            isVerified: true,
            isProfileComplete: true,
            displayName: decoded.name || "Admin",
        } as any;
        next();
    } catch {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}
