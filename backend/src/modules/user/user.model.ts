export interface StudentProfile {
    fullName: string;
    semester: number;
    branch: string;
    college: string;
    enrollmentNumber: string;
}

export interface TeacherProfile {
    fullName: string;
    teacherId: string;
}

export interface User {
    id?: string;               // Firestore document ID
    firebaseUid: string;       // from Firebase token
    email: string;
    photoURL?: string;
    role: "student" | "teacher" | "admin";
    isVerified: boolean;       // admin-controlled for teachers; auto-true for students
    isProfileComplete: boolean;
    studentProfile?: StudentProfile | null;
    teacherProfile?: TeacherProfile | null;
    createdAt?: Date;
    updatedAt?: Date;
    displayName?: string;
}

// Helper to calculate displayName consistently
export function getDisplayName(user: Partial<User>): string {
    if (user.studentProfile?.fullName) return user.studentProfile.fullName;
    if (user.teacherProfile?.fullName) return user.teacherProfile.fullName;
    return user.email || "";
}
