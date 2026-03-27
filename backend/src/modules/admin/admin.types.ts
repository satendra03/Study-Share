export interface AdminStats {
    totalUsers: number;
    totalMaterials: number;
    unverifiedTeachers: number;
    totalDownloads: number;
}

export interface AdminUserManagement {
    users: any[];
    total: number;
}

export interface AdminMaterialManagement {
    materials: any[];
    total: number;
}