import mongoose, { Schema, type Document } from 'mongoose';
import type { Material } from './material.types.js';

const MaterialSchema = new Schema<Material & Document>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploaderId: { type: String, required: true },
    downloads: { type: Number, default: 0 },
    status: { type: String, enum: ["processing", "done", "failed"], default: "processing" },
    subject: { type: String },
    subjectCode: { type: String },
    branch: { type: String },
    semester: { type: String },
    cloudinaryPublicId: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const MaterialModel = mongoose.model<Material & Document>('Material', MaterialSchema);
