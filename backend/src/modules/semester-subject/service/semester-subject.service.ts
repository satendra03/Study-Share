import { uploadFile, deleteFile } from "@/config/cloudinary.config.js";
import { BadRequestError, NotFoundError } from "@/shared/ApiError.js";
import { syllabusQueue } from "@/infrastructure/queue/syllabus.queue.js";
import { type SemesterSubject } from "../semester-subject.types.js";
import { type SemesterSubjectRepositoryInterface } from "../repository/semester-subject.repository.interface.js";
import {
    type CreateSemesterSubjectInput,
    type SemesterSubjectServiceInterface,
    type UpdateSemesterSubjectInput,
} from "./semester-subject.service.interface.js";

export class SemesterSubjectService implements SemesterSubjectServiceInterface {
    constructor(private repository: SemesterSubjectRepositoryInterface) {}

    create = async (
        data: CreateSemesterSubjectInput,
        file?: Express.Multer.File
    ): Promise<SemesterSubject> => {
        const semester = (data.semester || "").toString().trim();
        const subject = (data.subject || "").trim();
        if (!semester || !subject) {
            throw new BadRequestError("semester and subject are required");
        }

        const existing = await this.repository.findOneBySemesterSubject(semester, subject);
        if (existing) {
            throw new BadRequestError(`Subject "${subject}" already exists for semester ${semester}`);
        }

        const payload: Partial<SemesterSubject> = {
            semester,
            subject,
            subjectCode: data.subjectCode?.trim(),
            branch: data.branch?.trim(),
        };

        if (file) {
            const cloudFile = await uploadFile(file.buffer, {
                folder: "study-share/syllabi",
            });
            payload.syllabusFileUrl = cloudFile.url;
            payload.syllabusFileName = file.originalname;
            payload.syllabusCloudinaryPublicId = cloudFile.publicId;
            payload.syllabusStatus = "processing";
        }

        const created = await this.repository.create(payload);

        if (file && created._id) {
            await syllabusQueue.add(
                "process-syllabus",
                {
                    semesterSubjectId: created._id.toString(),
                    fileUrl: payload.syllabusFileUrl,
                },
                {
                    attempts: 3,
                    backoff: { type: "exponential", delay: 3000 },
                    removeOnComplete: true,
                    removeOnFail: false,
                }
            );
            console.log(`[SemesterSubjectService] Enqueued syllabus OCR for ${created._id}`);
        }

        return created;
    };

    list = async (filters?: { semester?: string; branch?: string }): Promise<SemesterSubject[]> => {
        return await this.repository.findAll(filters);
    };

    getById = async (id: string): Promise<SemesterSubject> => {
        const doc = await this.repository.findById(id);
        if (!doc) throw new NotFoundError("Subject not found");
        return doc;
    };

    update = async (
        id: string,
        data: UpdateSemesterSubjectInput,
        file?: Express.Multer.File
    ): Promise<SemesterSubject> => {
        const existing = await this.repository.findById(id);
        if (!existing) throw new NotFoundError("Subject not found");

        const payload: Partial<SemesterSubject> = {};
        if (data.semester !== undefined) payload.semester = data.semester.toString().trim();
        if (data.subject !== undefined) payload.subject = data.subject.trim();
        if (data.subjectCode !== undefined) payload.subjectCode = data.subjectCode?.trim();
        if (data.branch !== undefined) payload.branch = data.branch?.trim();

        // Reject conflicting (semester, subject) combo
        const targetSemester = payload.semester ?? existing.semester;
        const targetSubject = payload.subject ?? existing.subject;
        if (
            (payload.semester || payload.subject) &&
            (targetSemester !== existing.semester || targetSubject !== existing.subject)
        ) {
            const dup = await this.repository.findOneBySemesterSubject(targetSemester, targetSubject);
            if (dup && dup._id?.toString() !== id) {
                throw new BadRequestError(
                    `Subject "${targetSubject}" already exists for semester ${targetSemester}`
                );
            }
        }

        if (file) {
            // Replace existing syllabus file (delete old one if any)
            if (existing.syllabusCloudinaryPublicId) {
                await deleteFile(existing.syllabusCloudinaryPublicId, "raw").catch((err) =>
                    console.error("[SemesterSubject] Cloudinary delete failed:", err)
                );
            }
            const cloudFile = await uploadFile(file.buffer, {
                folder: "study-share/syllabi",
            });
            payload.syllabusFileUrl = cloudFile.url;
            payload.syllabusFileName = file.originalname;
            payload.syllabusCloudinaryPublicId = cloudFile.publicId;
            payload.syllabusStatus = "processing";
            payload.syllabusText = "";
        }

        const updated = await this.repository.update(id, payload);
        if (!updated) throw new NotFoundError("Subject not found");

        if (file) {
            await syllabusQueue.add(
                "process-syllabus",
                {
                    semesterSubjectId: id,
                    fileUrl: payload.syllabusFileUrl,
                },
                {
                    attempts: 3,
                    backoff: { type: "exponential", delay: 3000 },
                    removeOnComplete: true,
                    removeOnFail: false,
                }
            );
        }

        return updated;
    };

    delete = async (id: string): Promise<void> => {
        const existing = await this.repository.findById(id);
        if (!existing) throw new NotFoundError("Subject not found");

        if (existing.syllabusCloudinaryPublicId) {
            await deleteFile(existing.syllabusCloudinaryPublicId, "raw").catch((err) =>
                console.error("[SemesterSubject] Cloudinary delete failed:", err)
            );
        }
        await this.repository.delete(id);
    };

    getBySemesterAndSubject = async (
        semester: string,
        subject: string
    ): Promise<SemesterSubject | null> => {
        return await this.repository.findOneBySemesterSubject(semester, subject);
    };
}
