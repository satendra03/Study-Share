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
  id?: string;
  firebaseUid: string;
  email: string;
  photoURL?: string;
  role: "student" | "teacher" | "admin";
  isVerified: boolean;
  isProfileComplete: boolean;
  studentProfile?: StudentProfile | null;
  teacherProfile?: TeacherProfile | null;
  displayName?: string;
  bookmarkedMaterialIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Material {
  _id?: string;
  year: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploaderId: string;
  downloads?: number;
  status?: "processing" | "done" | "failed";
  subject?: string;
  subjectCode?: string;
  branch?: string;
  semester?: string;
  createdAt?: string;
  updatedAt?: string;
  title?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
