import { Queue, Worker } from "bullmq";
import { ocrService } from "@/modules/ocr/ocr.module.js";
import { MaterialModel } from "@/modules/materials/material.model.js";
import { getRedisOptions } from "@/config/redis.config.js";
import { AIService } from "@/modules/ai/ai.service.js";
import * as pdfjsLib from "pdfjs-dist";
import https from "https";
import http from "http";

// BullMQ expects a Redis connection config object (it manages the client lifecycle internally)
const connection = getRedisOptions();

// ✅ Export queue so MaterialService can push jobs to it
export const materialQueue = new Queue("material-processing", { connection });

// ─────────────────────────────────────────────────────────────────
// Helper: Download file from a URL into a Buffer
// ─────────────────────────────────────────────────────────────────
function downloadBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

// ─────────────────────────────────────────────────────────────────
// Helper: Try pdfjs text extraction first, fall back to OCR
// ─────────────────────────────────────────────────────────────────
async function extractTextFromPDF(buffer: Buffer): Promise<{ pageNumber: number; rawText: string }[]> {
  const getDoc = typeof pdfjsLib.getDocument === "function"
    ? pdfjsLib.getDocument
    : (pdfjsLib as any).default?.getDocument;

  if (!getDoc) throw new Error("pdfjsLib.getDocument is not a function");

  const uint8Array = new Uint8Array(buffer);
  const pdf = await getDoc({ data: uint8Array }).promise;
  const pages: { pageNumber: number; rawText: string }[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item: any) => item.str).join(" ");
    pages.push({ pageNumber: i, rawText: text });
  }

  // Check if we have sufficient text (not image-based PDF)
  const totalText = pages.map((p) => p.rawText).join("").trim();
  if (totalText.length > 100) {
    return pages;
  }

  // Otherwise use OCR for image-based / scanned PDFs
  console.log("  ↳ PDF appears image-based, falling back to OCR...");
  return await ocrService.extractPagesFromPDF(buffer);
}

// ─────────────────────────────────────────────────────────────────
// Worker — processes jobs from the "material-processing" queue
// ─────────────────────────────────────────────────────────────────
const worker = new Worker(
  "material-processing",
  async (job) => {
    const { materialId, fileUrl } = job.data;
    const logPrefix = `[Queue] Material ${materialId}`;

    console.log(`${logPrefix}: Starting processing (attempt ${job.attemptsMade + 1})...`);

    try {
      const buffer = await downloadBuffer(fileUrl);

      // ── Step 1: Extract pages (pdfjs → OCR fallback) ──────────
      console.log(`${logPrefix}: Extracting text from PDF...`);
      const pagesResult = await extractTextFromPDF(buffer);

      if (!pagesResult || pagesResult.length === 0) {
        console.warn(`${logPrefix}: No pages extracted, marking as failed.`);
        await MaterialModel.findByIdAndUpdate(materialId, { status: "failed" });
        return; // Don't retry — the PDF itself has no usable content
      }

      console.log(`${logPrefix}: Extracted ${pagesResult.length} pages.`);

      // ── Step 2: AI structuring (full-PDF metadata) ────────────
      console.log(`${logPrefix}: Running full-PDF AI structuring for metadata...`);
      const structuredData = await ocrService.structurePagesWithAI(pagesResult);
      const subject = structuredData.subject || null;
      console.log(`${logPrefix}: Detected subject: ${subject}`);

      // ── Step 3: Per-page AI structuring (parallel) ─────────────
      console.log(`${logPrefix}: Structuring ${pagesResult.length} pages in parallel...`);
      const pages = await Promise.all(
        pagesResult.map(async (page) => {
          const structured = await AIService.structurePageWithAI(
            page.rawText,
            page.pageNumber,
            subject
          );
          return {
            pageNumber: page.pageNumber,
            rawText: page.rawText,
            structured,
          };
        })
      );

      // ── Step 4: Update MongoDB with results ───────────────────
      // IMPORTANT: Only fill in fields that the user didn't already provide.
      // The user sets branch/semester/subject during upload — don't overwrite with AI guesses.
      const existing = await MaterialModel.findById(materialId).lean();
      const updateFields: Record<string, any> = {
        structuredData,
        pages,
        status: "done",
      };

      // Only backfill from AI if the user's value is empty/missing
      if (!existing?.subject && structuredData.subject) updateFields.subject = structuredData.subject;
      if (!existing?.subjectCode && structuredData.subjectCode) updateFields.subjectCode = structuredData.subjectCode;
      if (!existing?.branch && structuredData.branch) updateFields.branch = structuredData.branch;
      if (!existing?.semester && structuredData.semester) updateFields.semester = structuredData.semester;

      await MaterialModel.findByIdAndUpdate(materialId, updateFields);

      console.log(`${logPrefix}: ✅ Processing complete!`);
    } catch (error) {
      console.error(`${logPrefix}: ❌ Processing failed:`, error);

      // Mark as failed so frontend stops polling and shows error
      await MaterialModel.findByIdAndUpdate(materialId, { status: "failed" });

      // Rethrow so BullMQ marks the job as failed and can retry
      throw error;
    }
  },
  {
    connection,
    concurrency: 5, // Process up to 5 materials at once (tune based on server capacity)
  }
);

// ── Worker event listeners for observability ────────────────────
worker.on("completed", (job) => {
  console.log(`[Queue] Job ${job.id} (material: ${job.data.materialId}) completed.`);
});

worker.on("failed", (job, err) => {
  console.error(`[Queue] Job ${job?.id} (material: ${job?.data.materialId}) failed:`, err.message);
});

console.log("📋 Material processing queue + worker initialized.");