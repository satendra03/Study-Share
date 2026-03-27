import { uploadFile } from "@/config/cloudinary.config.js";
import { type Material, type PageData } from "../material.types.js";
import { type MaterialRepositoryInterface } from "../repository/material.repository.interface.js";
import { type MaterialServiceInterface } from "./material.service.interface.js";
import { NotFoundError } from "@/shared/ApiError.js";
import axios from 'axios';
// import * as pdfParse from 'pdf-parse';
import * as pdfjsLib from 'pdfjs-dist';
import { OCRService } from '@/modules/ocr/service/ocr.service.js';
import { ai } from "@/modules/ai/ai.service.js";

export class MaterialService implements MaterialServiceInterface {
    private ocrService = new OCRService();

    constructor(private materialRepository: MaterialRepositoryInterface) { }

    private async extractTextFromPDF(buffer: Buffer): Promise<{ pageNumber: number; rawText: string }[]> {
        // First, try extracting text with pdfjs
        const getDoc = typeof pdfjsLib.getDocument === "function" ? pdfjsLib.getDocument : (pdfjsLib as any).default?.getDocument;
        if (!getDoc) throw new Error("pdfjsLib.getDocument is not a function");
        const uint8Array = new Uint8Array(buffer);
        const pdf = await getDoc({ data: uint8Array }).promise;
        const pages: { pageNumber: number; rawText: string }[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items.map((item: any) => item.str).join(' ');
            pages.push({ pageNumber: i, rawText: text });
        }

        // Check if we have sufficient text (not image-based PDF)
        const totalText = pages.map(p => p.rawText).join('').trim();
        if (totalText.length > 100) { // If there's substantial text, use it
            return pages;
        }

        // Otherwise, use OCR for image-based PDFs
        console.log('PDF appears to be image-based, using OCR...');
        return await this.ocrService.extractPagesFromPDF(buffer);
    }

    createMaterial = async (data: Omit<Material, "id" | "createdAt" | "updatedAt" | "downloads" | "fileUrl" | "title">, file: Express.Multer.File): Promise<Material> => {
        // Generate title from branch, semester, subject, year
        const title = `${data.branch} ${data.semester} ${data.subject} ${data.year}`;

        // Upload to Cloudinary directly using the buffer from memoryStorage
        const cloudFile = await uploadFile(file.buffer);

        const material = await this.materialRepository.create({
            title,
            year: data.year,
            description: data.description || "",
            fileUrl: cloudFile.url,
            fileName: data.fileName,
            fileType: data.fileType,
            fileSize: data.fileSize,
            uploaderId: data.uploaderId,
            branch: data.branch,
            semester: data.semester,
            subject: data.subject,
            subjectCode: data.subjectCode,
            status: data.fileType === "PYQ" ? "processing" : "done",
        });

        // After saving, process OCR for PYQs in the background
        if (data.fileType === "PYQ") {
            (async () => {
                try {
                    // Extract text from PDF per page
                    const pages = await this.extractTextFromPDF(file.buffer);

                    if (!pages || pages.length === 0) {
                        await this.materialRepository.update(material._id as string, { status: "failed" });
                    } else {
                        await this.materialRepository.update(material._id as string, {
                            status: "done",
                            pages: pages as any
                        });
                    }
                } catch (error) {
                    console.error('Failed to process OCR:', error);
                    await this.materialRepository.update(material._id as string, { status: "failed" });
                }
            })();
        }

        return material;
    }

    getAllMaterials = async (): Promise<Material[]> => {
        return await this.materialRepository.findAll();
    }

    getMaterialById = async (id: string): Promise<Material> => {
        const material = await this.materialRepository.findById(id);
        if (!material) {
            throw new NotFoundError("Material not found");
        }
        return material;
    }

    recordDownload = async (id: string): Promise<void> => {
        await this.getMaterialById(id); // Ensure exists
        await this.materialRepository.incrementDownload(id);
    }

    deleteMaterial = async (id: string): Promise<void> => {
        await this.materialRepository.delete(id);
    }

    search = async (query: string, filters: { branch?: string; subject?: string; semester?: string }, limit: number): Promise<Material[]> => {
        return await this.materialRepository.searchFullText(query, filters, limit);
    }

    getProcessingStatus = async (id: string): Promise<{ status: string; year: string; subject?: string; subjectCode?: string; branch?: string; semester?: string }> => {
        const material = await this.materialRepository.findById(id);
        if (!material) {
            throw new NotFoundError("Material not found");
        }
        return {
            status: material.status || "processing",
            year: material.year,
            subject: material.subject,
            subjectCode: material.subjectCode,
            branch: material.branch,
            semester: material.semester
        };
    }

    getMyUploads = async (uid: string, page: number, limit: number): Promise<{ materials: Material[]; total: number; page: number; limit: number }> => {
        return await this.materialRepository.findByUploaderPaginated(uid, page, limit);
    }

    getMaterialPages = async (id: string): Promise<PageData[]> => {
        const material = await this.getMaterialById(id);
        return material.pages || [];
    }

    getMaterialPage = async (id: string, pageNumber: number): Promise<PageData> => {
        const pages = await this.getMaterialPages(id);
        const page = pages.find(p => p.pageNumber === pageNumber);
        if (!page) {
            throw new NotFoundError("Page not found");
        }
        return page;
    }

    chatWithMaterial = async (id: string, message: string, history: { role: string; content: string }[], pageNumber: number): Promise<{ reply: string; history: { role: string; content: string }[] }> => {
        const material = await this.materialRepository.findById(id);
        if (!material) {
            throw new NotFoundError("Material not found");
        }

        const pages = material.pages || [];
        const fullText = pages.map(p => `--- PAGE ${p.pageNumber} ---\n${p.rawText}`).join("\n\n");

        // Truncate to a reasonable limit just in case (e.g. 500k characters ~ 100k tokens)
        const docContext = fullText.length > 500000 ? fullText.substring(0, 500000) + "\n...[TRUNCATED]" : fullText;

        const systemInstruction = `
You are StudyShare AI, an expert academic assistant.

The user is viewing a Previous Year Question Paper (PYQ).
This document contains ONLY questions, not answers.

Your job:
- Understand the question from the document
- Generate a complete, correct, exam-ready answer

Context:
- Subject: ${material.subject || "Unknown"}
- Branch: ${material.branch || "Unknown"}
- Semester: ${material.semester || "Unknown"}
- Current Page: ${pageNumber}

Document Context:
${docContext}

Rules:
1. DO NOT say "answer not in document".
2. ALWAYS answer the question using your own knowledge.
3. Use the document only to understand the question.
4. Provide structured answers:
   - Definition
   - Explanation
   - Examples (if applicable)
5. Format answers for exams (clear, points, headings).
6. Be concise but complete.

`;

        const contents = history.map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }]
        }));

        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.3,
                }
            });

            const reply = response.text || "Sorry, I couldn't generate a response.";

            const newHistory = [...history, { role: "user", content: message }, { role: "assistant", content: reply }];

            return {
                reply,
                history: newHistory
            };
        } catch (error: any) {
            console.error("AI Chat Error:", error);
            throw new Error(error.message || "Failed to communicate with AI service");
        }
    }

    findMaterialsByIds = async (ids: string[]): Promise<Material[]> => {
        return await this.materialRepository.findByIds(ids);
    }

    findMaterialByIdOrNull = async (id: string): Promise<Material | null> => {
        return await this.materialRepository.findById(id);
    }
}
