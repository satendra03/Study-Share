import { type User } from "../user.model.js";

export interface UserRepositoryInterface {
    getUserCount(): Promise<number>;
    findByFirebaseUid(firebaseUid: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    updateById(id: string, updates: Partial<User>): Promise<User | null>;
    deleteById(id: string): Promise<boolean>;
    search(query: string): Promise<User[]>;
    createShell(data: { firebaseUid: string; email: string; photoURL?: string; role: "student" | "teacher"; }): Promise<User>;
    completeStudentProfile(firebaseUid: string, profile: { fullName: string; semester: number; branch: string; collegeId: string; enrollmentNumber: string; }): Promise<User | null>;
    completeTeacherProfile(firebaseUid: string, profile: { fullName: string; teacherId: string; }): Promise<User | null>;
    verifyUser(userId: string): Promise<User | null>;
    findUnverifiedTeachers(): Promise<User[]>;
    updatePhotoUrl(firebaseUid: string, photoURL: string): Promise<void>;
    toggleBookmark(userId: string, materialId: string, add: boolean): Promise<void>;
}