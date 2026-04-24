import { Queue, Worker } from "bullmq";
import https from "https";
import http from "http";
import { ocrService } from "@/modules/ocr/ocr.module.js";
import { SemesterSubjectModel } from "@/modules/semester-subject/semester-subject.model.js";
import { env } from "@/config/env.config.js";

const connection = env.REDIS_URL
    ? {
        url: env.REDIS_URL,
        maxRetriesPerRequest: null,
    }
    : {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        maxRetriesPerRequest: null,
    };

export const syllabusQueue = new Queue("syllabus-processing", { connection });

function downloadBuffer(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const client = url.startsWith("https") ? https : http;
        client
            .get(url, (res) => {
                const chunks: Buffer[] = [];
                res.on("data", (chunk) => chunks.push(chunk));
                res.on("end", () => resolve(Buffer.concat(chunks)));
                res.on("error", reject);
            })
            .on("error", reject);
    });
}

const worker = new Worker(
    "syllabus-processing",
    async (job) => {
        const { semesterSubjectId, fileUrl } = job.data;
        const logPrefix = `[Syllabus Queue] SemesterSubject ${semesterSubjectId}`;

        console.log(`${logPrefix}: Starting OCR (attempt ${job.attemptsMade + 1})...`);

        try {
            const buffer = await downloadBuffer(fileUrl);
            const pages = await ocrService.extractPagesFromPDF(buffer);

            if (!pages || pages.length === 0) {
                console.warn(`${logPrefix}: No pages extracted, marking failed.`);
                await SemesterSubjectModel.findByIdAndUpdate(semesterSubjectId, {
                    syllabusStatus: "failed",
                });
                return;
            }

            const syllabusText = pages
                .map((p) => `[Page ${p.pageNumber}]\n${p.rawText}`)
                .join("\n\n");

            await SemesterSubjectModel.findByIdAndUpdate(semesterSubjectId, {
                syllabusText,
                syllabusStatus: "done",
                updatedAt: new Date(),
            });

            console.log(`${logPrefix}: ✅ Syllabus OCR complete (${pages.length} pages, ${syllabusText.length} chars)`);
        } catch (error) {
            console.error(`${logPrefix}: ❌ OCR failed:`, error);
            await SemesterSubjectModel.findByIdAndUpdate(semesterSubjectId, {
                syllabusStatus: "failed",
            });
            throw error;
        }
    },
    {
        connection,
        concurrency: 3,
    }
);

worker.on("completed", (job) => {
    console.log(`[Syllabus Queue] Job ${job.id} (subject: ${job.data.semesterSubjectId}) completed.`);
});

worker.on("failed", (job, err) => {
    console.error(`[Syllabus Queue] Job ${job?.id} (subject: ${job?.data.semesterSubjectId}) failed:`, err.message);
});

console.log("📚 Syllabus processing queue + worker initialized.");
