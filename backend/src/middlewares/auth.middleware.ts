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
export async function requireAppUser(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    if (!req.firebaseUid) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const user = await userService.getUserByFirebaseUid(req.firebaseUid);

    if (!user || !user.isProfileComplete) {
        res.status(403).json({ message: "Profile incomplete", code: AuthCodes.PROFILE_INCOMPLETE });
        return;
    }

    req.appUser = user;
    next();
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
