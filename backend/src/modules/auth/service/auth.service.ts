import { auth } from "@/config/firebase.config.js";
import { type AuthServiceInterface } from "@/modules/auth/service/auth.service.interface.js";
import { type SignInResult, type RegisterResult } from "@/modules/auth/auth.types.js";
import { userService } from "@/modules/user/user.module.js";
import { type User } from "@/modules/user/user.model.js";

export class AuthService implements AuthServiceInterface {
    /**
     * Verify Firebase ID token → check if user exists in DB.`
     * Called immediately after Google sign-in on the frontend.
     */
    signIn = async (idToken: string): Promise<SignInResult> => {
        // 1. Verify the token with Firebase Admin SDK  
        const decoded = await auth.verifyIdToken(idToken);
        const { uid: firebaseUid, email, name, picture } = decoded;
        if (!email) {
            throw new Error("Firebase token has no email — Google accounts must have an email.");
        }
        // 2. Look up in our own database
        // we will not directly look in the repository
        const existingUser = await userService.getUserByFirebaseUid(firebaseUid);

        if (existingUser && existingUser.isProfileComplete) {
            // if (picture && existingUser.photoURL !== picture) {
            //     existingUser.photoURL = picture;
            //     await userService.updatePhotoUrl(firebaseUid, picture);
            // }
            return { status: "existing_user", user: existingUser };
        }

        // New user (or signed up but never completed profile)
        return { status: "new_user", firebaseUid, email, name: name || "", photoURL: picture || "" };
    }
    /**
     * Complete profile for a student.
     * Students are auto-verified and can upload immediately.
     */
    registerStudent = async (
        idToken: string,
        profile: {
            fullName: string;
            semester: number;
            branch: string;
            collegeId: string;
            enrollmentNumber: string;
        }
    ): Promise<RegisterResult> => {
        const decoded = await auth.verifyIdToken(idToken);
        const { uid: firebaseUid, email, picture } = decoded;
        if (!email) throw new Error("Token has no email");
    
        let user;
        try {
            user = await userService.getUserByFirebaseUid(firebaseUid);
        } catch (e) {
            user = await userService.createShell({ firebaseUid, email, photoURL: picture, role: "student" });
        }
    
        const updated = await userService.completeStudentProfile(firebaseUid, profile);
        if (!updated) throw new Error("Failed to save student profile");
    
        return { user: updated };
    }
    
    /**
     * Complete profile for a teacher.
     * Teachers remain unverified until admin approves.
     */
    registerTeacher = async (
        idToken: string,
        profile: {
            fullName: string;
            teacherId: string;
        }
    ): Promise<RegisterResult> => {
        const decoded = await auth.verifyIdToken(idToken);
        const { uid: firebaseUid, email, picture } = decoded;
        if (!email) throw new Error("Token has no email");
    
        let user;
        try {
            user = await userService.getUserByFirebaseUid(firebaseUid);
        } catch (e) {
            user = await userService.createShell({ firebaseUid, email, photoURL: picture, role: "teacher" });
        }
    
        const updated = await userService.completeTeacherProfile(firebaseUid, profile);
        if (!updated) throw new Error("Failed to save teacher profile");
    
        return { user: updated };
    }
    
    /**
     * Admin: manually verify a teacher account.
     */
    verifyTeacher = async (userId: string): Promise<User> => {
        const user = await userService.verifyUser(userId);
        if (!user) throw new Error("User not found");
        return user;
    }
    
    /**
     * Admin: list all teachers pending verification.
     */
    getPendingVerifications = async (): Promise<User[]> => {
        return userService.findUnverifiedTeachers();
    }
}
