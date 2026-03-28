import { type NextFunction, type Request, type Response } from "express";
import { type AuthServiceInterface } from "@/modules/auth/service/auth.service.interface.js";
import { ApiResponse } from "@/shared/ApiResponse.js";

export class AuthController {
    constructor(private authService: AuthServiceInterface) { }
    /**
     * POST /api/auth/signin
     * Body: { tokenId: string }
     * Called right after Google sign-in.
     */
    signIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if(!req.body) {
                res.status(400).json(ApiResponse.error("Body is required"));
                return;
            }
            const { idToken } = req.body;   
            if (!idToken) {
                res.status(400).json(ApiResponse.error("idToken is required"));
                return;
            }
            const result = await this.authService.signIn(idToken);
            if (result.status === "existing_user") {
                res.status(200).json(ApiResponse.success({ 
                    message: "User already exists", 
                    data: result.user
                 }));
            } else if (result.status === "incomplete_profile") {
                res.status(200).json(ApiResponse.success({
                    message: "Profile must be completed",
                    data: result.user,
                }));
            } else {
                res.status(200).json(ApiResponse.success({
                    message: "New user",
                    data: {
                        firebaseUid: result.firebaseUid,
                        email: result.email,
                        name: result.name,
                    }
                }));
            }
        } catch (error: any) {
            console.error("signIn error:", error);
            res.status(401).json(ApiResponse.error(error.message || "Authentication failed"));
        }
    };
    /**
     * POST /api/auth/register/student
     * Body: { tokenId, fullName, semester, branch, collegeId, enrollmentNumber }
     */
    registerStudent = async (req: Request, res: Response): Promise<void> => {
        try {
            if(!req.body) {
                res.status(400).json(ApiResponse.error("Body is required"));
                return;
            }
            const { idToken, fullName, semester, branch, collegeId, enrollmentNumber } = req.body;

            if (!idToken || !fullName || !semester || !branch || !collegeId || !enrollmentNumber) {
                res.status(400).json(ApiResponse.error("All student profile fields are required"));
                return;
            }

            const { user } = await this.authService.registerStudent(idToken, {
                fullName,
                semester: Number(semester),
                branch,
                collegeId,
                enrollmentNumber,
            });

            res.status(201).json(ApiResponse.success({ message: "Student registered successfully", data: user }));
        } catch (error: any) {
            console.error("registerStudent error:", error);
            res.status(400).json(ApiResponse.error(error.message || "Registration failed"));
        }
    };

    /**
     * POST /api/auth/register/teacher
     * Body: { idToken, fullName }
     */
    registerTeacher = async (req: Request, res: Response): Promise<void> => {
        try {
            const { idToken, fullName } = req.body;

            if (!idToken || !fullName) {
                res.status(400).json(ApiResponse.error("fullName is required"));
                return;
            }

            const { user } = await this.authService.registerTeacher(idToken, { fullName });

            res.status(201).json(ApiResponse.success({ message: "Teacher registered successfully", data: user }));
        } catch (error: any) {
            console.error("registerTeacher error:", error);
            res.status(400).json(ApiResponse.error(error.message || "Registration failed"));
        }
    };

    /**
     * GET /api/auth/me  (protected)
     * Returns the current user's profile.
     */
    getMe = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.firebaseUid) {
                res.status(401).json(ApiResponse.error("Unauthorized"));
                return;
            }
            const profile = req.profileUser ?? null;
            res.status(200).json(ApiResponse.success({
                message: profile ? "Current user profile" : "No profile registered yet",
                data: profile,
            }));
        } catch (error: any) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    };

    /**
     * GET /api/auth/admin/pending   (admin only)
     * Returns teachers waiting for verification.
     */
    getPendingVerifications = async (req: Request, res: Response): Promise<void> => {
        try {
            const pending = await this.authService.getPendingVerifications();
            res.status(200).json(ApiResponse.success({ message: "Pending verifications", data: pending }));
        } catch (error: any) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    };

    /**
     * PATCH /api/auth/admin/verify/:userId   (admin only)
     * Manually verify a teacher account.
     */
    verifyTeacher = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params["userId"] as string;
            const user = await this.authService.verifyTeacher(userId);
            res.status(200).json(ApiResponse.success({ message: "Teacher verified", data: user }));
        } catch (error: any) {
            res.status(400).json(ApiResponse.error(error.message));
        }
    };
}
