import { type SemesterSubject } from "../semester-subject.types.js";

export interface CreateSemesterSubjectInput {
    semester: string;
    subject: string;
    subjectCode?: string;
    branch?: string;
}

export interface UpdateSemesterSubjectInput {
    semester?: string;
    subject?: string;
    subjectCode?: string;
    branch?: string;
}

export interface SemesterSubjectServiceInterface {
    create(data: CreateSemesterSubjectInput, file?: Express.Multer.File): Promise<SemesterSubject>;
    list(filters?: { semester?: string; branch?: string }): Promise<SemesterSubject[]>;
    getById(id: string): Promise<SemesterSubject>;
    update(id: string, data: UpdateSemesterSubjectInput, file?: Express.Multer.File): Promise<SemesterSubject>;
    delete(id: string): Promise<void>;
    reprocess(id: string): Promise<SemesterSubject>;
    getBySemesterAndSubject(semester: string, subject: string): Promise<SemesterSubject | null>;
}
