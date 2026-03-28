import { type Types } from "mongoose";

export interface PageGroup {
  unit: string;
  questions: string[];
}

export interface PageData {
  pageNumber: number;
  rawText: string;
  structured: {
    groups: PageGroup[];
  };
}

export interface Material {
  _id?: Types.ObjectId | string;
  title?: string;
  year: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploaderId: string;
  uploaderName?: string;
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