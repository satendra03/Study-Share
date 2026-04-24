import { type SemesterSubject } from "../semester-subject.types.js";

export interface SemesterSubjectRepositoryInterface {
    create(data: Partial<SemesterSubject>): Promise<SemesterSubject>;
    findAll(filters?: { semester?: string; branch?: string }): Promise<SemesterSubject[]>;
    findById(id: string): Promise<SemesterSubject | null>;
    findOneBySemesterSubject(semester: string, subject: string): Promise<SemesterSubject | null>;
    update(id: string, data: Partial<SemesterSubject>): Promise<SemesterSubject | null>;
    delete(id: string): Promise<void>;
}
