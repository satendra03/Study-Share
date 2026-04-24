import { ai } from "@/modules/ai/ai.service.js";
import { MaterialModel } from "@/modules/materials/material.model.js";
import { semesterSubjectService } from "@/modules/semester-subject/semester-subject.module.js";
import { BadRequestError, NotFoundError } from "@/shared/ApiError.js";
import {
    getImportantTopicsPrompt,
    getTopicAnswerPrompt,
} from "./important-topics.prompt.js";
import { type ImportantTopic, type ImportantTopicsResult } from "./important-topics.types.js";

const MAX_PYQ_CHARS = 200_000; // ~50k tokens — leaves room for syllabus + prompt
const MAX_SYLLABUS_CHARS = 80_000;

export class ImportantTopicsService {
    extract = async (semester: string, subject: string): Promise<ImportantTopicsResult> => {
        if (!semester || !subject) {
            throw new BadRequestError("semester and subject are required");
        }

        // 1. Pull syllabus from admin-managed SemesterSubject
        const semSubject = await semesterSubjectService.getBySemesterAndSubject(semester, subject);
        const syllabusText = (semSubject?.syllabusText || "").slice(0, MAX_SYLLABUS_CHARS);

        // 2. Pull all processed PYQs for this semester+subject
        const pyqs = await MaterialModel.find({
            fileType: "PYQ",
            semester,
            subject,
            status: "done",
        })
            .sort({ year: -1 })
            .lean();

        if (pyqs.length === 0 && !syllabusText) {
            throw new NotFoundError(
                "No PYQs or syllabus found for this subject yet. Ask the admin to add the syllabus, or upload PYQs first."
            );
        }

        // 3. Combine PYQ raw text, year-tagged, capped at MAX_PYQ_CHARS
        let combined = "";
        for (const m of pyqs) {
            const tag = `\n\n=== YEAR ${m.year || "?"} ===\n`;
            const body = (m.pages || [])
                .map((p: any) => p.rawText || "")
                .join("\n")
                .trim();
            if (!body) continue;
            if (combined.length + tag.length + body.length > MAX_PYQ_CHARS) {
                combined += tag + body.slice(0, MAX_PYQ_CHARS - combined.length - tag.length);
                break;
            }
            combined += tag + body;
        }

        // 4. Ask Gemini for the curated topic list
        const prompt = getImportantTopicsPrompt(subject, semester, syllabusText, combined);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { temperature: 0.4 },
        });

        const raw = (response.text || "")
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();

        let topics: ImportantTopic[] = [];
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.topics)) {
                topics = parsed.topics
                    .filter((t: any) => t && typeof t.name === "string" && t.name.trim().length > 0)
                    .map((t: any) => ({
                        name: t.name.trim(),
                        importance: Number(t.importance) || 5,
                        frequency: Number(t.frequency) || 0,
                        category: ["high-frequency", "syllabus-core", "concept", "other"].includes(t.category)
                            ? t.category
                            : "other",
                        reason: t.reason || "",
                        sampleQuestions: Array.isArray(t.sampleQuestions)
                            ? t.sampleQuestions.slice(0, 3).map((q: any) => String(q))
                            : [],
                    }))
                    .sort((a: ImportantTopic, b: ImportantTopic) => b.importance - a.importance)
                    .slice(0, 12);
            }
        } catch (err) {
            console.error("[ImportantTopics] Failed to parse LLM response:", err);
        }

        return {
            semester,
            subject,
            pyqCount: pyqs.length,
            hasSyllabus: !!syllabusText,
            topics,
        };
    };

    answer = async (
        topic: string,
        semester: string,
        subject: string
    ): Promise<{ topic: string; answer: string }> => {
        if (!topic || !semester || !subject) {
            throw new BadRequestError("topic, semester and subject are required");
        }

        // Pull syllabus + a small slice of PYQs to ground the answer
        const semSubject = await semesterSubjectService.getBySemesterAndSubject(semester, subject);
        const syllabusText = (semSubject?.syllabusText || "").slice(0, MAX_SYLLABUS_CHARS);

        const pyqs = await MaterialModel.find({
            fileType: "PYQ",
            semester,
            subject,
            status: "done",
        })
            .sort({ year: -1 })
            .limit(5)
            .lean();

        // Find PYQ snippets that mention the topic (very loose match) so the LLM has real exam context
        const needle = topic.toLowerCase();
        const snippets: string[] = [];
        for (const m of pyqs) {
            for (const p of m.pages || []) {
                const text = (p as any).rawText || "";
                if (text.toLowerCase().includes(needle)) {
                    snippets.push(`(${m.year}) ${text.slice(0, 1500)}`);
                    if (snippets.length >= 6) break;
                }
            }
            if (snippets.length >= 6) break;
        }
        const pyqContext = snippets.join("\n\n---\n\n");

        const prompt = getTopicAnswerPrompt(topic, subject, semester, syllabusText, pyqContext);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { temperature: 0.3 },
        });

        const answer = response.text || "Sorry, I couldn't generate an answer for this topic.";
        return { topic, answer };
    };
}
