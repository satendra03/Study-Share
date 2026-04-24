import { SemesterSubjectModel } from "../semester-subject.model.js";
import { type SemesterSubject } from "../semester-subject.types.js";
import { type SemesterSubjectRepositoryInterface } from "./semester-subject.repository.interface.js";

export class SemesterSubjectRepository implements SemesterSubjectRepositoryInterface {
    create = async (data: Partial<SemesterSubject>): Promise<SemesterSubject> => {
        const doc = new SemesterSubjectModel(data);
        await doc.save();
        return doc.toObject() as SemesterSubject;
    };

    findAll = async (filters?: { semester?: string; branch?: string }): Promise<SemesterSubject[]> => {
        const query: Record<string, any> = {};
        if (filters?.semester) query.semester = filters.semester;
        if (filters?.branch) query.branch = filters.branch;

        const docs = await SemesterSubjectModel.find(query)
            .sort({ semester: 1, subject: 1 })
            .lean();
        return docs as SemesterSubject[];
    };

    findById = async (id: string): Promise<SemesterSubject | null> => {
        const doc = await SemesterSubjectModel.findById(id).lean();
        return (doc as SemesterSubject) ?? null;
    };

    findOneBySemesterSubject = async (semester: string, subject: string): Promise<SemesterSubject | null> => {
        const doc = await SemesterSubjectModel.findOne({ semester, subject }).lean();
        return (doc as SemesterSubject) ?? null;
    };

    update = async (id: string, data: Partial<SemesterSubject>): Promise<SemesterSubject | null> => {
        const updated = await SemesterSubjectModel.findByIdAndUpdate(
            id,
            { ...data, updatedAt: new Date() },
            { returnDocument: "after" }
        ).lean();
        return (updated as SemesterSubject) ?? null;
    };

    delete = async (id: string): Promise<void> => {
        await SemesterSubjectModel.findByIdAndDelete(id);
    };
}
