import { uploadFile, deleteFile } from "@/config/cloudinary.config.js";
import { type Material } from "../material.types.js";
import { type MaterialRepositoryInterface } from "../repository/material.repository.interface.js";
import { type MaterialServiceInterface } from "./material.service.interface.js";
import { NotFoundError } from "@/shared/ApiError.js";
import { chatbotService } from "@/modules/chatbot/chatbot.module.js";
import { materialQueue } from "@/infrastructure/queue/material.queue.js";
import { type ChatTurn } from "@/modules/chatbot/chatbot.types.js";

interface ChatResult {
  reply: string;
}

export class MaterialService implements MaterialServiceInterface {
  constructor(private materialRepository: MaterialRepositoryInterface) {}

  createMaterial = async (
    data: Omit<Material, "id" | "createdAt" | "updatedAt" | "downloads" | "fileUrl">,
    file: Express.Multer.File,
  ): Promise<Material> => {
    // Step 1: save to MongoDB immediately with status "processing"
    const material = await this.materialRepository.create({
      title: data.title,
      description: data.description || "",
      fileUrl: "pending", // Will be updated by worker
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      uploaderId: data.uploaderId,
      cloudinaryPublicId: "pending", // Will be updated by worker
      status: "processing",   // ✅ set immediately so frontend can start polling
    });

    // Step 2: push to queue and return — Cloudinary upload and OCR run in background
    await materialQueue.add(
      "process-material",
      {
        materialId: material._id!.toString(),
        fileBuffer: Array.from(file.buffer),  // ✅ Buffer → Array for BullMQ serialization
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000, // 5s, 10s, 20s
        },
      }
    );

    return material;  // ✅ returns in <50ms
  };

  getAllMaterials = async (): Promise<Material[]> => {
    return await this.materialRepository.findAll();
  };

  getMaterialById = async (id: string): Promise<Material> => {
    const material = await this.materialRepository.findById(id);
    if (!material) throw new NotFoundError("Material not found");
    return material;
  };

  deleteMaterial = async (id: string): Promise<void> => {
    const material = await this.getMaterialById(id);
    // ✅ delete from Cloudinary if exists
    if (material.cloudinaryPublicId) {
      await deleteFile(material.cloudinaryPublicId);
    }

    // ✅ delete record from MongoDB
    await this.materialRepository.delete(id);
  };

  recordDownload = async (id: string): Promise<void> => {
    await this.getMaterialById(id);
    await this.materialRepository.incrementDownload(id);
  };

  search = async (
    query: string,
    filters: { branch?: string; subject?: string; semester?: string },
    limit: number
  ): Promise<Material[]> => {
    // Basic search fallback since Qdrant is removed
    return await this.materialRepository.findByFilters(filters, limit);
  };

  getProcessingStatus = async (id: string): Promise<{
    status: string;
    title: string;
    subject?: string;
    subjectCode?: string;
    branch?: string;
    semester?: string;
  }> => {
    const material = await this.getMaterialById(id);
    return {
      status: material.status || "processing",
      title: material.title,
      subject: material.subject,
      subjectCode: material.subjectCode,
      branch: material.branch,
      semester: material.semester,
    };
  };

  getMyUploads = async (
    uid: string,
    page: number,
    limit: number
  ): Promise<{ materials: Material[]; total: number; page: number; limit: number }> => {
    return await this.materialRepository.findByUploaderPaginated(uid, page, limit);
  };

  getMaterialPages = async (id: string) => {
    const material = await this.getMaterialById(id);
    return material.pages || [];
  };

  getMaterialPage = async (id: string, pageNumber: number) => {
    const material = await this.getMaterialById(id);
    const page = material.pages?.find(p => p.pageNumber === pageNumber);
    if (!page) throw new NotFoundError("Page not found");
    return page;
  };

  chatWithMaterial = async (
    id: string,
    message: string,
    history: ChatTurn[],
    pageNumber: number,
  ): Promise<{ reply: string; history: ChatTurn[] }> => {
    // Validate material exists
    await this.getMaterialById(id);

    const trimmedHistory = history.slice(-6);
    const result: ChatResult = await chatbotService.chat({
      message,
      history: trimmedHistory,
      pdfId: id,
      pageNumber,
    });

    return {
      reply: result.reply,
      history: [
        ...trimmedHistory,
        { role: "user", content: message },
        { role: "assistant", content: result.reply },
      ],
    };
  };
}