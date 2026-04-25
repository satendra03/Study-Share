import { generateWithRetry } from "@/modules/ai/ai.service.js";
import { MaterialModel } from "@/modules/materials/material.model.js";
import { semesterSubjectService } from "@/modules/semester-subject/semester-subject.module.js";
import { BadRequestError, NotFoundError } from "@/shared/ApiError.js";
import {
    getImportantTopicsPrompt,
    getModuleWiseTopicsPrompt,
    getMindMapPrompt,
    getTopicAnswerPrompt,
} from "./important-topics.prompt.js";
import {
    type ImportantTopic,
    type ImportantTopicsResult,
    type ModuleWiseTopics,
    type MindMapResult,
    type MindMapModule,
} from "./important-topics.types.js";

const stripJsonFences = (text: string): string =>
    text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

const MAX_PYQ_CHARS = 200_000; // ~50k tokens — leaves room for syllabus + prompt
const MAX_SYLLABUS_CHARS = 80_000;

export class ImportantTopicsService {
    extract = async (semester: string, subject: string): Promise<ImportantTopicsResult> => {
        if (!semester || !subject) {
            throw new BadRequestError("semester and subject are required");
        }

        // 1. Pull syllabus from admin-managed SemesterSubject
        // Prefer the module-structured form (higher signal, much shorter) over raw OCR text.
        const semSubject = await semesterSubjectService.getBySemesterAndSubject(semester, subject);
        const structuredSyllabus = semSubject?.syllabusStructured;
        const syllabusText = structuredSyllabus && structuredSyllabus.modules.length > 0
            ? structuredSyllabus.modules
                .map((m) => `${m.name}${m.title ? `: ${m.title}` : ""}\n- ${m.topics.join("\n- ")}`)
                .join("\n\n")
                .slice(0, MAX_SYLLABUS_CHARS)
            : (semSubject?.syllabusText || "").slice(0, MAX_SYLLABUS_CHARS);

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

        // 4. Ask Gemini for the curated topic list (5-retry w/ backoff)
        // Pass the actual list of years present so the LLM can't invent "last 4 years" claims.
        const pyqYears = Array.from(new Set(pyqs.map((m: any) => String(m.year || "")).filter(Boolean)))
            .sort((a, b) => Number(b) - Number(a));
        const prompt = getImportantTopicsPrompt(subject, semester, syllabusText, combined, pyqYears);
        let responseText = "";
        try {
            responseText = await generateWithRetry(prompt, {
                logPrefix: "[ImportantTopics-Extract]",
                temperature: 0.4,
            });
        } catch (err: any) {
            console.error("[ImportantTopics-Extract] All LLM providers failed");
        }

        const raw = responseText
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
                    .slice(0, 25);
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
        const structuredSyllabus = semSubject?.syllabusStructured;
        const syllabusText = structuredSyllabus && structuredSyllabus.modules.length > 0
            ? structuredSyllabus.modules
                .map((m) => `${m.name}${m.title ? `: ${m.title}` : ""}\n- ${m.topics.join("\n- ")}`)
                .join("\n\n")
                .slice(0, MAX_SYLLABUS_CHARS)
            : (semSubject?.syllabusText || "").slice(0, MAX_SYLLABUS_CHARS);

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
        let answer = "";
        try {
            answer = await generateWithRetry(prompt, {
                logPrefix: `[ImportantTopics-Answer]`,
                temperature: 0.3,
            });
        } catch (err: any) {
            console.error(`[ImportantTopics-Answer] All LLM providers failed`);
            answer = "Sorry, the AI services are currently overloaded. Please try again in a few minutes.";
        }

        return { topic, answer: answer || "Sorry, I couldn't generate an answer for this topic." };
    };

    // ── Shared loader: syllabus + PYQs for a (semester, subject) ─────────────
    private loadContext = async (semester: string, subject: string) => {
        const semSubject = await semesterSubjectService.getBySemesterAndSubject(semester, subject);
        const structuredSyllabus = semSubject?.syllabusStructured;
        const syllabusText = structuredSyllabus && structuredSyllabus.modules.length > 0
            ? structuredSyllabus.modules
                .map((m) => `${m.name}${m.title ? `: ${m.title}` : ""}\n- ${m.topics.join("\n- ")}`)
                .join("\n\n")
                .slice(0, MAX_SYLLABUS_CHARS)
            : (semSubject?.syllabusText || "").slice(0, MAX_SYLLABUS_CHARS);

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

        const pyqYears = Array.from(new Set(pyqs.map((m: any) => String(m.year || "")).filter(Boolean)))
            .sort((a, b) => Number(b) - Number(a));

        return { syllabusText, pyqs, combined, pyqYears };
    };

    // ── Module-wise important topics ─────────────────────────────────────────
    extractModuleWise = async (semester: string, subject: string): Promise<ModuleWiseTopics> => {
        if (!semester || !subject) throw new BadRequestError("semester and subject are required");

        const { syllabusText, pyqs, combined, pyqYears } = await this.loadContext(semester, subject);
        const prompt = getModuleWiseTopicsPrompt(subject, semester, syllabusText, combined, pyqYears);

        let responseText = "";
        try {
            responseText = await generateWithRetry(prompt, {
                logPrefix: "[ImportantTopics-ModuleWise]",
                temperature: 0.4,
            });
        } catch (err: any) {
            console.error("[ImportantTopics-ModuleWise] All LLM providers failed");
        }

        let modules: ModuleWiseTopics["modules"] = [];
        try {
            const parsed = JSON.parse(stripJsonFences(responseText));
            if (Array.isArray(parsed.modules)) {
                modules = parsed.modules
                    .filter((m: any) => m && typeof m.name === "string")
                    .map((m: any) => ({
                        name: String(m.name).trim() || "Module",
                        title: typeof m.title === "string" ? m.title.trim() : "",
                        topics: Array.isArray(m.topics)
                            ? m.topics
                                .filter((t: any) => t && typeof t.name === "string")
                                .map((t: any) => ({
                                    name: String(t.name).trim(),
                                    importance: Number(t.importance) || 5,
                                    frequency: Math.max(0, Math.min(pyqYears.length || 1, Number(t.frequency) || 0)),
                                    reason: t.reason || "",
                                    sampleQuestions: Array.isArray(t.sampleQuestions)
                                        ? t.sampleQuestions.slice(0, 3).map((q: any) => String(q))
                                        : [],
                                }))
                                .sort((a: any, b: any) => b.importance - a.importance)
                                .slice(0, 8)
                            : [],
                    }));
            }
        } catch (err) {
            console.error("[ImportantTopics-ModuleWise] Failed to parse response:", err);
        }

        return {
            semester,
            subject,
            pyqCount: pyqs.length,
            hasSyllabus: !!syllabusText,
            modules,
        };
    };

    // ── Mind Map — syllabus-only, keeps every module + every topic ──────────
    generateMindMap = async (semester: string, subject: string): Promise<MindMapResult> => {
        if (!semester || !subject) throw new BadRequestError("semester and subject are required");

        const semSubject = await semesterSubjectService.getBySemesterAndSubject(semester, subject);
        const structured = semSubject?.syllabusStructured;
        if (!structured || structured.modules.length === 0) {
            throw new NotFoundError(
                "Mind map needs a structured syllabus. Ask the admin to upload and re-run the syllabus first."
            );
        }

        // Compact input for the LLM — keep module+topic structure exact
        const syllabusModulesJson = JSON.stringify(
            {
                modules: structured.modules.map((m) => ({
                    name: m.name,
                    title: m.title,
                    topics: m.topics,
                })),
            },
            null,
            2
        );

        const prompt = getMindMapPrompt(subject, semester, syllabusModulesJson);

        let responseText = "";
        try {
            responseText = await generateWithRetry(prompt, {
                logPrefix: "[ImportantTopics-MindMap]",
                temperature: 0.3,
            });
        } catch (err: any) {
            console.error("[ImportantTopics-MindMap] All LLM providers failed");
        }

        // Parse LLM response and then ENFORCE completeness against the input syllabus.
        let llmModules: Array<{ name: string; title: string; order: number; topics: Array<{ name: string; note: string; order: number }> }> = [];
        try {
            const parsed = JSON.parse(stripJsonFences(responseText));
            if (Array.isArray(parsed.modules)) {
                llmModules = parsed.modules.map((m: any, mi: number) => ({
                    order: Number(m.order) || mi + 1,
                    name: String(m.name || "").trim(),
                    title: String(m.title || "").trim(),
                    topics: Array.isArray(m.topics)
                        ? m.topics.map((t: any, ti: number) => ({
                            order: Number(t.order) || ti + 1,
                            name: String(t.name || "").trim(),
                            note: String(t.note || "").trim(),
                        }))
                        : [],
                }));
            }
        } catch (err) {
            console.error("[ImportantTopics-MindMap] Failed to parse response:", err);
        }

        // Build the final modules list from the SYLLABUS (source of truth),
        // using LLM ordering/notes where they exist, falling back to syllabus order.
        const modules: MindMapModule[] = structured.modules.map((syllMod, mi) => {
            const llmMatch =
                llmModules.find((m) => m.name.toLowerCase() === syllMod.name.toLowerCase()) ||
                llmModules[mi];

            const llmTopicLookup = new Map<string, { order: number; note: string }>();
            if (llmMatch) {
                for (const lt of llmMatch.topics) {
                    llmTopicLookup.set(lt.name.toLowerCase(), { order: lt.order, note: lt.note });
                }
            }

            // Every syllabus topic appears. LLM's order+note used if available, else syllabus order preserved.
            const orderedTopics = syllMod.topics.map((topicName, ti) => {
                const match = llmTopicLookup.get(topicName.toLowerCase());
                return {
                    order: match?.order ?? ti + 1,
                    name: topicName,
                    note: match?.note ?? "",
                };
            });
            // Sort by LLM-assigned order (ties broken by original syllabus index)
            orderedTopics.sort((a, b) => a.order - b.order);
            // Renumber sequentially so the UI shows 1..N cleanly
            orderedTopics.forEach((t, i) => (t.order = i + 1));

            return {
                order: llmMatch?.order ?? mi + 1,
                name: syllMod.name,
                title: syllMod.title,
                topics: orderedTopics,
            };
        });

        // Respect LLM module-level order, fall back to syllabus
        modules.sort((a, b) => a.order - b.order);
        modules.forEach((m, i) => (m.order = i + 1));

        // PYQ count is optional context for the UI
        const pyqCount = await MaterialModel.countDocuments({
            fileType: "PYQ",
            semester,
            subject,
            status: "done",
        });

        return {
            semester,
            subject,
            pyqCount,
            hasSyllabus: true,
            modules,
        };
    };
}
