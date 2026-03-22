import { type SignInResult, type RegisterResult } from "@/modules/auth/auth.types.js";
import { type User } from "@/modules/user/user.model.js";
export interface AuthServiceInterface {
    signIn(idToken: string): Promise<SignInResult>;
    registerStudent(idToken: string, profile: { fullName: string; semester: number; branch: string; collegeId: string; enrollmentNumber: string; }): Promise<RegisterResult>;
    registerTeacher(idToken: string, profile: { fullName: string; teacherId: string; }): Promise<RegisterResult>;
    verifyTeacher(userId: string): Promise<User>;
    getPendingVerifications(): Promise<User[]>;
}