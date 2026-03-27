import { db } from '@/config/firebase.config.js';
import { type AdminRepositoryInterface } from './admin.repository.interface.js';
import { type AdminStats, type AdminUserManagement, type AdminMaterialManagement } from '../admin.types.js';
import { MaterialModel } from '@/modules/materials/material.model.js';

export class AdminRepository implements AdminRepositoryInterface {
    async getStats(): Promise<AdminStats> {
        // Users from Firebase
        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;
        const unverifiedTeachers = usersSnapshot.docs.filter(doc => {
            const data = doc.data();
            return data.role === 'teacher' && !data.isVerified;
        }).length;

        // Materials from Mongo
        const totalMaterials = await MaterialModel.countDocuments();
        const totalDownloads = await MaterialModel.aggregate([
            { $group: { _id: null, total: { $sum: '$downloadCount' } } }
        ]).then(result => result[0]?.total || 0);

        return {
            totalUsers,
            totalMaterials,
            unverifiedTeachers,
            totalDownloads,
        };
    }

    async getUsers(page: number, limit: number): Promise<AdminUserManagement> {
        const offset = (page - 1) * limit;
        const snapshot = await db.collection('users').offset(offset).limit(limit).get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const total = (await db.collection('users').get()).size;
        return { users, total };
    }

    async getMaterials(page: number, limit: number): Promise<AdminMaterialManagement> {
        const offset = (page - 1) * limit;
        const materials = await MaterialModel.find().skip(offset).limit(limit);
        const total = await MaterialModel.countDocuments();
        return { materials: materials.map(m => m.toObject()), total };
    }
}