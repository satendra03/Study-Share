import axios from "axios";
import { config } from "dotenv";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { createRequire } from "module";
import { type StructuredPaper } from "@/types/paper.types.js";
import { AIService } from "@/modules/ai/ai.service.js";

const require = createRequire(import.meta.url);
const pdfjs = (pdfjsLib as any).default;
pdfjs.GlobalWorkerOptions.workerSrc =
  require.resolve("pdfjs-dist/legacy/build/pdf.worker.js");

config();

// ---------------- OCR CONFIG ----------------
const ocrUrl =
  process.env.NVIDIA_OCR_URL ||
  "https://ai.api.nvidia.com/v1/cv/baidu/paddleocr";

const ocrHeaders = {
  Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
  Accept: "application/json",
};

// ---------------- SERVICE ----------------
export interface PageResult {
  pageNumber: number;
  rawText: string;
}

export class OCRService {
  // -------- 1. CHECK IF PAGE HAS SELECTABLE TEXT --------
  private async isPageTextBased(page: any, pageNum: number): Promise<boolean> {
    const textContent = await page.getTextContent();
    const meaningfulItems = textContent.items.filter(
      (item: any) => item.str && item.str.trim().length > 0,
    );
    console.log(`Page ${pageNum}: ${meaningfulItems.length} text items found`);

    // ✅ Lowered threshold from 5 to 2 — page 1 often has few items due to logo/header
    return meaningfulItems.length > 2;
  }

  // -------- 2. EXTRACT TEXT DIRECTLY (text-based PDFs) --------
  private async extractTextFromPage(page: any): Promise<string> {
    const textContent = await page.getTextContent();

    let text = "";
    let lastY: number | null = null;

    for (const item of textContent.items as any[]) {
      const currentY = item.transform?.[5]; // Y position of text item

      // ✅ Insert newline when Y position changes significantly (new line in PDF)
      if (lastY !== null && Math.abs(currentY - lastY) > 5) {
        text += "\n";
      }

      text += item.str;
      lastY = currentY;
    }

    return text.trim();
  }

  // -------- 3. RENDER PAGE TO IMAGE (scanned PDFs) --------
  private async renderPageToImage(page: any): Promise<Buffer> {
    const viewport = page.getViewport({ scale: 1.0 });
    const { createCanvas } = await import("canvas");
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    await page.render({
      canvasContext: context as any,
      viewport,
    }).promise;

    // ✅ JPEG at 0.7 quality keeps file size well under 135KB for most pages
    return canvas.toBuffer("image/jpeg", { quality: 0.7 });
  }

  // -------- 4. OCR API CALL (scanned images) --------
  private async ocrImage(imageBuffer: Buffer): Promise<string> {
    // ✅ Check raw buffer — base64 inflates by ~33% so 135KB raw ≈ 180KB base64 (API limit)
    if (imageBuffer.length > 135_000) {
      // retry at lower quality instead of throwing
      throw new Error(
        `Image too large for OCR API: ${imageBuffer.length} bytes (max ~135KB)`,
      );
    }

    const imageB64 = imageBuffer.toString("base64");

    const payload = {
      input: [
        {
          type: "image_url",
          // ✅ JPEG buffer so mime type must match
          url: `data:image/jpeg;base64,${imageB64}`,
        },
      ],
    };

    const response = await axios.post(ocrUrl, payload, {
      headers: ocrHeaders,
      responseType: "json",
    });

    // ✅ NVIDIA PaddleOCR response: data[0].text_detections[].text_prediction.text
    const detections = response.data?.data?.[0]?.text_detections;
    if (Array.isArray(detections)) {
      return detections
        .map((item: any) => item?.text_prediction?.text || "")
        .filter(Boolean)
        .join(" ");
    }

    return "";
  }

  // -------- 5. EXTRACT ALL PAGES TEXT --------
  async extractPagesFromPDF(pdfBuffer: Buffer): Promise<PageResult[]> {
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(pdfBuffer),
      useSystemFonts: true,
      disableFontFace: true,
    });
    const pdf = await loadingTask.promise;

    const pages: PageResult[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);

      // ✅ Smart routing: text-based pages skip OCR entirely (faster + more accurate)
      const textBased = await this.isPageTextBased(page, i);

      if (textBased) {
        console.log(`Page ${i}: text-based → direct extraction`);
        const text = await this.extractTextFromPage(page);
        pages.push({ pageNumber: i, rawText: text });
      } else {
        console.log(`Page ${i}: scanned → OCR`);
        try {
          let imageBuffer = await this.renderPageToImage(page);

          // ✅ If image too large, retry at lower quality before failing
          if (imageBuffer.length > 135_000) {
            console.log(
              `Page ${i}: image too large (${imageBuffer.length}), retrying at lower quality`,
            );
            const viewport = page.getViewport({ scale: 0.75 });
            const { createCanvas } = await import("canvas");
            const canvas = createCanvas(viewport.width, viewport.height);
            await page.render({
              canvasContext: canvas.getContext("2d") as any,
              viewport,
            }).promise;
            imageBuffer = canvas.toBuffer("image/jpeg", { quality: 0.5 });
          }

          const text = await this.ocrImage(imageBuffer);
          pages.push({ pageNumber: i, rawText: text });
        } catch (err) {
          console.error(`Page ${i} OCR failed:`, err);
          pages.push({ pageNumber: i, rawText: "" }); // don't let one page failure kill the whole PDF
        }

      }
    }

    return pages;
  }

  // -------- 6. STRUCTURE FULL PDF --------
  async structurePagesWithAI(pages: PageResult[]): Promise<StructuredPaper> {
    const fullRawText = pages
      .map((p) => `[Page ${p.pageNumber}]\n${p.rawText}`)
      .join("\n\n");

    console.log("Raw text extracted, sending to AI structuring...");
    return await AIService.structureWithAI(fullRawText);
  }

  // -------- 7. MAIN ENTRY POINT (Full PDF) --------
  async extractTextFromPDFWithOCR(pdfBuffer: Buffer): Promise<StructuredPaper> {
    const pages = await this.extractPagesFromPDF(pdfBuffer);
    return await this.structurePagesWithAI(pages);
  }
}
