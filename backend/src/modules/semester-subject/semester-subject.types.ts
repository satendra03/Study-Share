import { type Types } from "mongoose";

export type SyllabusStatus = "processing" | "done" | "failed";

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
    syllabusStatus?: SyllabusStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
