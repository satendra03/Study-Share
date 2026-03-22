import { Queue, Worker } from "bullmq";
import { ocrService } from "@/modules/ocr/ocr.module.js";
import { MaterialModel } from "@/modules/materials/material.model.js";
import { getRedisOptions } from "@/config/redis.config.js";
import { AIService } from "@/modules/ai/ai.service.js";
import { uploadFile } from "@/config/cloudinary.config.js";

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
      const buffer = Buffer.from(fileBuffer);
      
      // Step 1: Upload to Cloudinary
      console.log(`Material ${materialId}: Uploading to Cloudinary...`);
      const cloudFile = await uploadFile(buffer);
      await MaterialModel.findByIdAndUpdate(materialId, {
        fileUrl: cloudFile.url,
        cloudinaryPublicId: cloudFile.publicId,
      });

      // Step 2: Extract pages using OCR
      console.log(`Material ${materialId}: Extracting pages...`);
      const pagesResult = await ocrService.extractPagesFromPDF(buffer);

      // Step 2: Structure each page individually
      console.log(`Material ${materialId}: Structuring ${pagesResult.length} pages independently...`);
      const pages = [];
      for (const page of pagesResult) {
        const structured = await AIService.structurePageWithAI(page.rawText, page.pageNumber);
        pages.push({
          pageNumber: page.pageNumber,
          rawText: page.rawText,
          structured
        });
      }

      // Step 3: Run the existing full-PDF structuring to get subject, semester, etc.
      console.log(`Material ${materialId}: Running full PDF structure for metadata...`);
      const structuredData = await ocrService.structurePagesWithAI(pagesResult);

      // Step 4: update MongoDB with extracted metadata + status done
      await MaterialModel.findByIdAndUpdate(materialId, {
        structuredData: structuredData,
        pages: pages,
        subject: structuredData.subject,
        subjectCode: structuredData.subjectCode,
        branch: structuredData.branch,
        semester: structuredData.semester,
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