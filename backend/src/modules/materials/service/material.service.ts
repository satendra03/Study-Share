import { uploadFile, deleteFile } from "@/config/cloudinary.config.js";
import { type Material, type PageData } from "../material.types.js";
import { type MaterialRepositoryInterface } from "../repository/material.repository.interface.js";
import { type MaterialServiceInterface } from "./material.service.interface.js";
import { BadRequestError, NotFoundError } from "@/shared/ApiError.js";
import { ai } from "@/modules/ai/ai.service.js";
import { materialQueue } from "@/infrastructure/queue/material.queue.js";
import { db } from "@/config/firebase.config.js";

export class MaterialService implements MaterialServiceInterface {
    constructor(private materialRepository: MaterialRepositoryInterface) { }

    createMaterial = async (data: Omit<Material, "id" | "createdAt" | "updatedAt" | "downloads" | "fileUrl" | "title">, file: Express.Multer.File): Promise<Material> => {
        // Block duplicate PYQs (same semester + subject + year already exists)
        if (data.fileType === "PYQ" && data.semester && data.subject && data.year) {
            const existing = await this.materialRepository.findExistingPyq(
                data.semester,
                data.subject,
                data.year
            );
            if (existing) {
                throw new BadRequestError(
                    `A PYQ for ${data.subject} (Sem ${data.semester}, ${data.year}) is already uploaded.`
                );
            }
        }

        // Generate title: Branch-Semester-Subject-Year
        const title = `${data.branch}-${data.semester}-${data.subject}-${data.year}`;

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
            uploaderName: data.uploaderName,
            branch: data.branch,
            semester: data.semester,
            subject: data.subject,
            subjectCode: data.subjectCode,
            status: data.fileType === "PYQ" ? "processing" : "done",
        });

        // ── Enqueue background processing via BullMQ ──────────────
        // For PYQ: extract text → AI structuring → update MongoDB
        // The job runs in the worker with retry support, concurrency
        // control, and crash recovery.
        if (data.fileType === "PYQ") {
            await materialQueue.add(
                "process-material",
                {
                    materialId: material._id as string,
                    fileUrl: cloudFile.url, // fetch from Cloudinary in worker — don't store buffer in Redis
                },
                {
                    attempts: 3,
                    backoff: { type: "exponential", delay: 3000 },
                    removeOnComplete: true,
                    removeOnFail: false,
                }
            );
            console.log(`[MaterialService] Enqueued processing job for material ${material._id}`);
        }

        return material;
    }

    getAllMaterials = async (filters?: { branch?: string; subject?: string; semester?: string; year?: string; fileType?: string }): Promise<Material[]> => {
        const materials = await this.materialRepository.findAll(filters);

        // Backfill uploaderName for legacy materials that were saved without it
        const missing = materials.filter(m => !m.uploaderName && m.uploaderId);
        if (missing.length > 0) {
            const uids = [...new Set(missing.map(m => m.uploaderId))];
            const nameMap: Record<string, string> = {};
            await Promise.all(
                uids.map(async (uid) => {
                    try {
                        const doc = await db.collection("users").doc(uid).get();
                        const data = doc.data();
                        nameMap[uid] = data?.displayName || data?.studentProfile?.fullName || data?.teacherProfile?.fullName || data?.email || uid;
                    } catch {
                        nameMap[uid] = uid;
                    }
                })
            );
            return materials.map(m =>
                !m.uploaderName && m.uploaderId
                    ? { ...m, uploaderName: nameMap[m.uploaderId] }
                    : m
            );
        }

        return materials;
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
        const material = await this.materialRepository.findById(id);
        if (material?.fileUrl) {
            // Extract Cloudinary public ID from the URL
            // e.g. https://res.cloudinary.com/xxx/image/upload/v123/study-share/materials/file_abc
            const match = material.fileUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
            if (match?.[1]) {
                await deleteFile(match[1], "raw").catch((err) =>
                    console.error(`[Delete] Cloudinary deletion failed for ${match[1]}:`, err)
                );
            }
        }
        await this.materialRepository.delete(id);
    }

    search = async (query: string, filters: { branch?: string; subject?: string; semester?: string; year?: string }, limit: number): Promise<Material[]> => {
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
