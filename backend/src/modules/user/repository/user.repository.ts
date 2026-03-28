import { db } from "@/config/firebase.config.js";
import type { User } from "@/modules/user/user.model.js";
import { getDisplayName } from "@/modules/user/user.model.js";
import type { UserRepositoryInterface } from "./user.repository.interface.js";

const usersCollection = db.collection("users");

export class UserRepository implements UserRepositoryInterface {
    /** Find a user by their Firebase UID */
    findByFirebaseUid = async (firebaseUid: string): Promise<User | null> => {
        const doc = await usersCollection.doc(firebaseUid).get();
        if (!doc.exists) return null;
        const data = doc.data() as User;
        data.id = doc.id;
        data.displayName = getDisplayName(data);
        return data;
    }

    /** Find a user by their email */
    findByEmail = async (email: string): Promise<User | null> => {
        const snapshot = await usersCollection.where("email", "==", email.toLowerCase()).limit(1).get();
        if (snapshot.empty) return null;
        const data = snapshot.docs[0]!.data() as User;
        data.id = snapshot.docs[0]!.id;
        data.displayName = getDisplayName(data);
        return data;
    }

    /** Find a user by their ID */
    findById = async (id: string): Promise<User | null> => {
        return this.findByFirebaseUid(id);
    }

    updateById = async (id: string, updates: Partial<User>): Promise<User | null> => {
        await usersCollection.doc(id).update({
            ...updates,
            updatedAt: new Date(),
        });
        return this.findByFirebaseUid(id);
    }

    deleteById = async (id: string): Promise<boolean> => {
        await usersCollection.doc(id).delete();
        return true;
    }

    search = async (query: string): Promise<User[]> => {
        // Search by email or name (for students/teachers)
        const emailQuery = usersCollection.where("email", ">=", query.toLowerCase()).where("email", "<=", query.toLowerCase() + '\uf8ff');
        const snapshot = await emailQuery.get();
        const users: User[] = [];

        snapshot.docs.forEach(doc => {
            const data = doc.data() as User;
            data.id = doc.id;
            data.displayName = getDisplayName(data);
            users.push(data);
        });

        // Also search in studentProfile.fullName and teacherProfile.fullName
        // But Firestore doesn't support OR, so this is simplified
        return users;
    }

    /** Create a brand-new user (no profile yet after first Google sign-in) */
    createShell = async (data: {
        firebaseUid: string;
        email: string;
        photoURL?: string;
        role: "student" | "teacher";
    }): Promise<User> => {
        const newUser: User = {
            firebaseUid: data.firebaseUid,
            email: data.email.toLowerCase(),
            photoURL: data.photoURL || "",
            role: data.role,
            isVerified: false,
            isProfileComplete: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await usersCollection.doc(data.firebaseUid).set(newUser);
        newUser.id = data.firebaseUid;
        newUser.displayName = getDisplayName(newUser);
        return newUser;
    }

    /** Complete the user's profile after the registration form */
    completeStudentProfile = async (
        firebaseUid: string,
        profile: {
            fullName: string;
            semester: number;
            branch: string;
            collegeId: string;
            enrollmentNumber: string;
        }
    ): Promise<User | null> => {
        await usersCollection.doc(firebaseUid).update({
            studentProfile: profile,
            isProfileComplete: true,
            isVerified: false,
            updatedAt: new Date(),
        });
        return this.findByFirebaseUid(firebaseUid);
    }

    completeTeacherProfile = async (
        firebaseUid: string,
        profile: {
            fullName: string;
        }
    ): Promise<User | null> => {
        await usersCollection.doc(firebaseUid).update({
            teacherProfile: profile,
            isProfileComplete: true,
            isVerified: false,
            updatedAt: new Date(),
        });
        return this.findByFirebaseUid(firebaseUid);
    }

    /** Admin: verify a teacher */
    verifyUser = async (userId: string): Promise<User | null> => {
        await usersCollection.doc(userId).update({
            isVerified: true,
            updatedAt: new Date(),
        });
        return this.findByFirebaseUid(userId);
    }

    /** Admin: get all unverified teachers */
    findUnverifiedTeachers = async (): Promise<User[]> => {
        const snapshot = await usersCollection
            .where("role", "==", "teacher")
            .where("isProfileComplete", "==", true)
            .where("isVerified", "==", false)
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data() as User;
            data.id = doc.id;
            data.displayName = getDisplayName(data);
            return data;
        });
    }

    /** Sync user photo on login */
    updatePhotoUrl = async (firebaseUid: string, photoURL: string): Promise<void> => {
        if (!photoURL) return;
        await usersCollection.doc(firebaseUid).update({
            photoURL,
            updatedAt: new Date(),
        });
    }

    /** Get total user count */
    getUserCount = async (): Promise<number> => {
        const snapshot = await usersCollection.get();
        return snapshot.size;
    }

    /** Toggle bookmark for a material */
    toggleBookmark = async (userId: string, materialId: string, add: boolean): Promise<void> => {
        const { FieldValue } = await import("firebase-admin/firestore");
        await usersCollection.doc(userId).update({
            bookmarkedMaterialIds: add
                ? FieldValue.arrayUnion(materialId)
                : FieldValue.arrayRemove(materialId),
            updatedAt: new Date(),
        });
    }
};
