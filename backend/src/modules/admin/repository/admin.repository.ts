import { db, auth } from '@/config/firebase.config.js';
import { type AdminRepositoryInterface } from './admin.repository.interface.js';
import { type AdminStats, type AdminUserManagement, type AdminMaterialManagement } from '../admin.types.js';
import { MaterialModel } from '@/modules/materials/material.model.js';

export class AdminRepository implements AdminRepositoryInterface {
    async getStats(): Promise<AdminStats> {
        const usersSnapshot = await db.collection('users').get();
        const allUsers = usersSnapshot.docs.map(d => d.data());

        const totalUsers = allUsers.length;
        const totalStudents = allUsers.filter(u => u.role === 'student').length;
        const totalTeachers = allUsers.filter(u => u.role === 'teacher').length;
        const unverifiedUsers = allUsers.filter(u => !u.isVerified && u.isProfileComplete).length;
        const unverifiedTeachers = allUsers.filter(u => u.role === 'teacher' && !u.isVerified).length;

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentUsers = allUsers.filter(u => {
            const createdAt = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
            return createdAt >= sevenDaysAgo;
        }).length;

        const totalMaterials = await MaterialModel.countDocuments();
        const processingMaterials = await MaterialModel.countDocuments({ status: 'processing' });
        const failedMaterials = await MaterialModel.countDocuments({ status: 'failed' });
        const recentUploads = await MaterialModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        const totalDownloads = await MaterialModel.aggregate([
            { $group: { _id: null, total: { $sum: '$downloads' } } }
        ]).then(result => result[0]?.total || 0);

        return {
            totalUsers,
            totalStudents,
            totalTeachers,
            totalMaterials,
            processingMaterials,
            failedMaterials,
            unverifiedUsers,
            unverifiedTeachers,
            totalDownloads,
            recentUploads,
            recentUsers,
        };
    }

    async getUsers(page: number, limit: number, role?: string, verified?: string): Promise<AdminUserManagement> {
        let query: FirebaseFirestore.Query = db.collection('users');

        if (role && role !== 'all') {
            query = query.where('role', '==', role);
        }
        if (verified === 'true') {
            query = query.where('isVerified', '==', true);
        } else if (verified === 'false') {
            query = query.where('isVerified', '==', false);
        }

        const totalSnap = await query.get();
        const total = totalSnap.size;

        const offset = (page - 1) * limit;
        const snapshot = await query.offset(offset).limit(limit).get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return { users, total };
    }

    async getMaterials(page: number, limit: number, status?: string): Promise<AdminMaterialManagement> {
        const offset = (page - 1) * limit;
        let query: any = MaterialModel.find();

        if (status && status !== 'all') {
            query = MaterialModel.find({ status });
        }

        const total = await (status && status !== 'all'
            ? MaterialModel.countDocuments({ status })
            : MaterialModel.countDocuments());

        const materials = await query.sort({ createdAt: -1 }).skip(offset).limit(limit);
        return { materials: materials.map((m: any) => m.toObject()), total };
    }

    async verifyUser(userId: string, verified: boolean): Promise<any> {
        await db.collection('users').doc(userId).update({
            isVerified: verified,
            updatedAt: new Date(),
        });
        const doc = await db.collection('users').doc(userId).get();
        return { id: doc.id, ...doc.data() };
    }

    async deleteUser(userId: string): Promise<void> {
        // Delete from Firestore
        await db.collection('users').doc(userId).delete();
        // Delete from Firebase Auth
        try {
            await auth.deleteUser(userId);
        } catch {
            // Auth user may not exist (e.g., teacher created via admin)
        }
    }

    async deleteMaterial(materialId: string): Promise<void> {
        await MaterialModel.findByIdAndDelete(materialId);
    }

    async createTeacher(email: string, password: string, fullName: string, teacherId: string): Promise<any> {
        // Create Firebase Auth user
        const firebaseUser = await auth.createUser({
            email,
            password,
            displayName: fullName,
        });

        const uid = firebaseUser.uid;

        // Create Firestore user document
        const userData = {
            firebaseUid: uid,
            email: email.toLowerCase(),
            photoURL: '',
            role: 'teacher',
            isVerified: true, // Admin-created teachers are auto-verified
            isProfileComplete: true,
            teacherProfile: {
                fullName,
                teacherId,
            },
            displayName: fullName,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.collection('users').doc(uid).set(userData);
        return { id: uid, ...userData };
    }
}
