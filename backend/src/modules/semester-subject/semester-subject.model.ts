import mongoose, { Schema, type Document } from "mongoose";
import type { SemesterSubject } from "./semester-subject.types.js";

const SemesterSubjectSchema = new Schema<SemesterSubject & Document>({
    semester: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    subjectCode: { type: String },
    branch: { type: String },
    syllabusFileUrl: { type: String },
    syllabusFileName: { type: String },
    syllabusCloudinaryPublicId: { type: String },
    syllabusText: { type: String },
    syllabusStructured: { type: Object },
    syllabusStatus: { type: String, enum: ["processing", "done", "failed"] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// One subject name per semester (admin can't add the same subject twice)
SemesterSubjectSchema.index({ semester: 1, subject: 1 }, { unique: true });

SemesterSubjectSchema.pre("save", async function () {
    this.updatedAt = new Date();
});

export const SemesterSubjectModel = mongoose.model<SemesterSubject & Document>(
    "SemesterSubject",
    SemesterSubjectSchema
);
