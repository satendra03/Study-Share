import { type Types } from "mongoose";

export type SyllabusStatus = "processing" | "done" | "failed";

export interface SyllabusModule {
    name: string;
    title: string;
    topics: string[];
}

export interface StructuredSyllabus {
    modules: SyllabusModule[];
    courseOutcomes: string[];
    textbooks: string[];
}

export interface SemesterSubject {
    _id?: Types.ObjectId | string;
    semester: string;
    subject: string;
    subjectCode?: string;
    branch?: string;
    syllabusFileUrl?: string;
    syllabusFileName?: string;
    syllabusCloudinaryPublicId?: string;
    syllabusText?: string;
    syllabusStructured?: StructuredSyllabus;
    syllabusStatus?: SyllabusStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
