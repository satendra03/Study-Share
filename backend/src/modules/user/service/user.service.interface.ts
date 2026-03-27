import { type User } from "../user.model.js";

export interface UserServiceInterface {
    getUserByFirebaseUid(firebaseUid: string): Promise<User>;
    getUserByFirebaseUidOrNull(firebaseUid: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User>;
    getUserById(userId: string): Promise<User>;
    updateUser(userId: string, updates: Partial<User>): Promise<User>;
    deleteUser(userId: string): Promise<void>;
    searchUsers(query: string): Promise<User[]>;
    updatePhotoUrl(firebaseUid: string, photoURL: string): Promise<void>;
    createShell(data: { firebaseUid: string; email: string; photoURL?: string; role: "student" | "teacher"; }): Promise<User>;
    completeStudentProfile(firebaseUid: string, profile: { fullName: string; semester: number; branch: string; collegeId: string; enrollmentNumber: string; }): Promise<User>;
    completeTeacherProfile(firebaseUid: string, profile: { fullName: string; teacherId: string; }): Promise<User>;
    verifyUser(userId: string): Promise<User>;
    findUnverifiedTeachers(): Promise<User[]>;
    toggleBookmark(userId: string, materialId: string, add: boolean): Promise<void>;
}