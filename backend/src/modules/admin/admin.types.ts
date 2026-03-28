export interface AdminStats {
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalMaterials: number;
    processingMaterials: number;
    failedMaterials: number;
    unverifiedUsers: number;
    unverifiedTeachers: number;
    totalDownloads: number;
    recentUploads: number; // last 7 days
    recentUsers: number;   // last 7 days
}

export interface AdminUserManagement {
    users: any[];
    total: number;
}

export interface AdminMaterialManagement {
    materials: any[];
    total: number;
}
