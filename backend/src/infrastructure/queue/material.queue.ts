import { Queue, Worker } from "bullmq";
import { ocrService } from "@/modules/ocr/ocr.module.js";
import { MaterialModel } from "@/modules/materials/material.model.js";
import { embeddingService } from "@/modules/embeddings/embeddings.module.js";
import { getRedisOptions } from "@/config/redis.config.js";

// BullMQ expects a Redis connection config object (it manages the client lifecycle internally)
const connection = getRedisOptions();

// ✅ Export queue so MaterialService can push jobs to it
export const materialQueue = new Queue("material-processing", { connection });

// ✅ Worker runs in background — auto-picks jobs from the queue
new Worker(
  "material-processing",
  async (job: any) => {
    const { materialId, fileBuffer } = job.data;
    console.log(`Processing material ${materialId}...`);

    try {
      // Step 1: OCR + AI structuring
      const buffer = Buffer.from(fileBuffer);
      const structured = await ocrService.extractTextFromPDFWithOCR(buffer);

      // Step 2: send to Python embedding service (skip sections with no content)
      for (const yearPaper of structured.papers) {
        for (const section of yearPaper.sections) {
          const hasQuestions = Array.isArray(section.questions) && section.questions.some((q: string) => q?.trim());
          const hasText = typeof (section as any).text === "string" && (section as any).text.trim();
          if (!hasQuestions && !hasText) continue;

          await embeddingService.processPage({
            pdfId: materialId,
            year: yearPaper.year,
            sectionTitle: section.title,
            questions: section.questions ?? [],
            ...(hasText && !hasQuestions ? { text: (section as any).text } : {}),
          });
        }
      }

      // Step 3: update MongoDB with extracted metadata + status done
      await MaterialModel.findByIdAndUpdate(materialId, {
        structuredData: structured,
        subject: structured.subject,
        subjectCode: structured.subjectCode,
        branch: structured.branch,
        semester: structured.semester,
        status: "done",
      });

      console.log(`Material ${materialId} processed successfully`);

    } catch (error) {
      console.error(`Material ${materialId} processing failed:`, error);

      // ✅ Mark failed so frontend stops polling and shows error
      await MaterialModel.findByIdAndUpdate(materialId, { status: "failed" });
      throw error; // ✅ rethrow so BullMQ marks job as failed and can retry
    }
  },
  {
    connection,
    // ✅ retry up to 2 times before marking permanently failed
    // configured at job level when adding to queue
  }
);