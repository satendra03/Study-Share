import { type Types } from "mongoose";

export interface PageData {
  pageNumber: number;
  rawText: string;
  structured: {
    unit: string;
    questions: string[];
  };
}

export interface Material {
  _id?: Types.ObjectId | string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploaderId: string;
  downloads?: number;
  createdAt?: Date;
  updatedAt?: Date;
  status?: "processing" | "done" | "failed";
  subject?: string;
  subjectCode?: string;
  branch?: string;
  semester?: string;
  cloudinaryPublicId?: string;
  structuredData?: any;
  pages?: PageData[];
}