import { type UserServiceInterface } from "./user.service.interface.js";
import { type UserRepositoryInterface } from "@/modules/user/repository/user.repository.interface.js";
import { type User } from "@/modules/user/user.model.js";

export class UserService implements UserServiceInterface {
    constructor(private userRepository: UserRepositoryInterface) { }
    
    async getPublicStats(): Promise<{ users: number; status: string }> {
        const usersCount = await this.userRepository.getUserCount();
        const baseOffset = 0;
        return {
            users: usersCount + baseOffset,
            status: "online"
        };
    }

    async getUserById(userId: string): Promise<User> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    async getUserByFirebaseUid(firebaseUid: string): Promise<User> {
        const user = await this.userRepository.findByFirebaseUid(firebaseUid);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    async getUserByFirebaseUidOrNull(firebaseUid: string): Promise<User | null> {
        return await this.userRepository.findByFirebaseUid(firebaseUid);
    }

    async getUserByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    async updateUser(userId: string, updates: Partial<User>): Promise<User> {
        const user = await this.userRepository.updateById(userId, updates);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    async deleteUser(userId: string): Promise<void> {
        const deleted = await this.userRepository.deleteById(userId);
        if (!deleted) {
            throw new Error("User not found");
        }
    }

    async searchUsers(query: string): Promise<User[]> {
        return this.userRepository.search(query);
    }

    async updatePhotoUrl(firebaseUid: string, photoURL: string): Promise<void> {
        return this.userRepository.updatePhotoUrl(firebaseUid, photoURL);
    }

    async createShell(data: { firebaseUid: string; email: string; photoURL?: string; role: "student" | "teacher" }): Promise<User> {
        return this.userRepository.createShell(data);
    }

    async completeStudentProfile(firebaseUid: string, profile: { fullName: string; semester: number; branch: string; collegeId: string; enrollmentNumber: string }): Promise<User> {
        const user = await this.userRepository.completeStudentProfile(firebaseUid, profile);
        if (!user) throw new Error("Failed to complete student profile");
        return user;
    }

    async completeTeacherProfile(firebaseUid: string, profile: { fullName: string }): Promise<User> {
        const user = await this.userRepository.completeTeacherProfile(firebaseUid, profile);
        if (!user) throw new Error("Failed to complete teacher profile");
        return user;
    }

    async verifyUser(userId: string): Promise<User> {
        const user = await this.userRepository.verifyUser(userId);
        if (!user) throw new Error("User not found");
        return user;
    }

    async findUnverifiedTeachers(): Promise<User[]> {
        return this.userRepository.findUnverifiedTeachers();
    }

    async toggleBookmark(userId: string, materialId: string, add: boolean): Promise<void> {
        return this.userRepository.toggleBookmark(userId, materialId, add);
    }
}