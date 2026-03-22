import { type User } from "@/modules/user/user.model.js";

export class AuthMapper {
    static sanitizeUser(user: User) {
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            displayName: user.displayName,
            photoURL: user.photoURL ?? null,
            isVerified: user.isVerified,
            isProfileComplete: user.isProfileComplete,
            studentProfile: user.studentProfile ?? null,
            teacherProfile: user.teacherProfile ?? null,
        };
    }
}