import { uploadFile, deleteFile } from "@/config/cloudinary.config.js";
import { type Material } from "../material.types.js";
import { type MaterialRepositoryInterface } from "../repository/material.repository.interface.js";
import { type MaterialServiceInterface } from "./material.service.interface.js";
import { NotFoundError } from "@/shared/ApiError.js";
import { chatbotService } from "@/modules/chatbot/chatbot.module.js";
import { materialQueue } from "@/infrastructure/queue/material.queue.js";
import { type ChatTurn } from "@/modules/chatbot/chatbot.types.js";
import { embeddingService } from "@/modules/embeddings/embeddings.module.js";
import { type QdrantSearchResult } from "@/modules/embeddings/service/embedding.service.js";

interface ChatResult {
  reply: string;
}

export class MaterialService implements MaterialServiceInterface {
  constructor(private materialRepository: MaterialRepositoryInterface) {}

  createMaterial = async (
    data: Omit<Material, "id" | "createdAt" | "updatedAt" | "downloads" | "fileUrl">,
    file: Express.Multer.File,
  ): Promise<Material> => {
    // Step 1: upload to cloudinary
    const cloudFile = await uploadFile(file.buffer);

    // Step 2: save to MongoDB immediately with status "processing"
    const material = await this.materialRepository.create({
      title: data.title,
      description: data.description || "",
      fileUrl: cloudFile.url,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      uploaderId: data.uploaderId,
      cloudinaryPublicId: cloudFile.publicId,
      status: "processing",   // ✅ set immediately so frontend can start polling
    });

    // Step 3: push to queue and return — do NOT await OCR here
    await materialQueue.add("process-material", {
      materialId: material._id!.toString(),
      fileBuffer: Array.from(file.buffer),  // ✅ Buffer → Array for BullMQ serialization
    });

    return material;  // ✅ returns in <1s, OCR runs in background
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

    // ✅ delete embeddings from Qdrant
    await embeddingService.deleteByPdfId(id);

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
    if (!query) {
      return await this.materialRepository.findByFilters(filters, limit);
    }

    const qdrantResults: QdrantSearchResult[] = await embeddingService.search({
      query,
      filters,
      limit,
    });

    const pdfIds = qdrantResults.map((r) => r.pdfId);
    const materials = await this.materialRepository.findByIds(pdfIds);

    // ✅ Deduplicate and attach similarity score, preserving Qdrant ranking order
    const materialMap = new Map(
      materials.map((m) => [m._id!.toString(), m])
    );

    const seen = new Set<string>();
    const result: (Material & { similarity?: number })[] = [];

    for (const r of qdrantResults) {
      const material = materialMap.get(r.pdfId);
      if (material && !seen.has(r.pdfId)) {
        seen.add(r.pdfId);
        result.push({ ...material, similarity: r.similarity });
      }
    }

    return result;
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

  chatWithMaterial = async (
    id: string,
    message: string,
    history: ChatTurn[]
  ): Promise<{ reply: string; history: ChatTurn[] }> => {
    const material = await this.getMaterialById(id);
    const trimmedHistory = history.slice(-6);
    const result: ChatResult = await chatbotService.chat({
      message,
      history: trimmedHistory,
      pdfId: material._id!.toString(),
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