// Dump everything a subject has: syllabus modules + all PYQ questions grouped by year.
// Run from backend/ with: node scripts/dump-content.mjs
//
// Output: content-dump-YYYYMMDD-HHMMSS.md in the backend/ directory.
//
// Each subject section contains:
//   - metadata (branch / status / file links)
//   - syllabus modules + topics (from SemesterSubject.syllabusStructured)
//   - every PYQ for that subject grouped by year, questions grouped by module

import "dotenv/config";
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";

async function main() {
    const uri = process.env.MONGODB_ATLAS;
    if (!uri) {
        console.error("❌ MONGODB_ATLAS not set in .env");
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    const subjects = await mongoose.connection
        .collection("semestersubjects")
        .find({})
        .sort({ semester: 1, subject: 1 })
        .toArray();

    // Also collect PYQ subjects that don't have a SemesterSubject entry yet
    const pyqDistinct = await mongoose.connection
        .collection("materials")
        .aggregate([
            { $match: { fileType: "PYQ", status: "done" } },
            { $group: { _id: { semester: "$semester", subject: "$subject" } } },
        ])
        .toArray();

    const known = new Set(subjects.map((s) => `${s.semester}__${s.subject}`));
    const orphanPyqs = pyqDistinct
        .filter((d) => !known.has(`${d._id.semester}__${d._id.subject}`))
        .map((d) => ({
            semester: d._id.semester,
            subject: d._id.subject,
            _orphan: true,
        }));

    const allSubjects = [...subjects, ...orphanPyqs];

    if (allSubjects.length === 0) {
        console.log("Nothing to dump — no SemesterSubjects or PYQs found.");
        await mongoose.disconnect();
        process.exit(0);
    }

    const stamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .slice(0, 19);
    const outFile = path.resolve(process.cwd(), `content-dump-${stamp}.md`);

    const out = [];
    out.push(`# Study-Share content dump`);
    out.push(`Generated: ${new Date().toISOString()}`);
    out.push(`Subjects: ${allSubjects.length}  (with syllabus: ${subjects.length}, PYQ-only: ${orphanPyqs.length})`);
    out.push("");

    let grandQuestionCount = 0;
    let grandPyqCount = 0;

    for (const s of allSubjects) {
        const header = `## Sem ${s.semester} — ${s.subject}${s.subjectCode ? ` (${s.subjectCode})` : ""}`;
        out.push(header);
        out.push("");

        if (s._orphan) {
            out.push(`> ⚠️ No SemesterSubject record yet — PYQ uploader used a free-text subject name that admin hasn't added as an official subject.`);
            out.push("");
        } else {
            out.push(`- **Branch:** ${s.branch || "—"}`);
            out.push(`- **Syllabus status:** ${s.syllabusStatus || "no syllabus uploaded"}`);
            if (s.syllabusFileUrl) out.push(`- **Syllabus PDF:** ${s.syllabusFileUrl}`);
            out.push("");
        }

        // ── Syllabus modules ──────────────────────────────────────
        const modules = s.syllabusStructured?.modules || [];
        if (modules.length > 0) {
            out.push(`### 📘 Syllabus modules (${modules.length})`);
            out.push("");
            for (const m of modules) {
                out.push(`#### ${m.name}${m.title ? ` — ${m.title}` : ""}`);
                if (Array.isArray(m.topics) && m.topics.length > 0) {
                    for (const t of m.topics) out.push(`- ${t}`);
                } else {
                    out.push(`_(no topics extracted)_`);
                }
                out.push("");
            }
        } else if (!s._orphan) {
            out.push(`### 📘 Syllabus modules`);
            out.push(`_(none — Gemini structuring hasn't succeeded for this subject yet)_`);
            out.push("");
        }

        // ── PYQs for this (semester, subject), grouped by year ────
        const pyqs = await mongoose.connection
            .collection("materials")
            .find({
                fileType: "PYQ",
                semester: s.semester,
                subject: s.subject,
                status: "done",
            })
            .sort({ year: -1 })
            .toArray();

        if (pyqs.length === 0) {
            out.push(`### 📝 PYQs`);
            out.push(`_(no completed PYQs uploaded for this subject yet)_`);
            out.push("");
        } else {
            out.push(`### 📝 PYQs by year (${pyqs.length} paper${pyqs.length === 1 ? "" : "s"})`);
            out.push("");

            for (const p of pyqs) {
                grandPyqCount++;
                out.push(`#### Year ${p.year || "?"} — ${p.title || p.fileName || "(untitled)"}`);
                out.push(`- **Uploader:** ${p.uploaderName || p.uploaderId || "Anonymous"}`);
                out.push(`- **Uploaded:** ${p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "—"}`);
                out.push(`- **Pages:** ${(p.pages || []).length}`);
                out.push(`- **File:** ${p.fileUrl || "—"}`);
                out.push("");

                // Collect all questions from every page's groups, preserving module order
                const byModule = new Map();
                for (const pg of p.pages || []) {
                    for (const g of pg.structured?.groups || []) {
                        const unit = g.unit || "Module-1";
                        if (!byModule.has(unit)) byModule.set(unit, []);
                        const arr = byModule.get(unit);
                        for (const q of g.questions || []) arr.push(q);
                    }
                }

                if (byModule.size === 0) {
                    out.push(`_(no structured questions — LLM may have skipped this paper)_`);
                    out.push("");
                } else {
                    let total = 0;
                    for (const [unit, questions] of byModule.entries()) {
                        out.push(`##### ${unit}`);
                        questions.forEach((q, i) => {
                            out.push(`${i + 1}. ${q}`);
                            total++;
                        });
                        out.push("");
                    }
                    grandQuestionCount += total;
                    out.push(`_(${total} question${total === 1 ? "" : "s"} extracted)_`);
                    out.push("");
                }
            }
        }

        out.push("---");
        out.push("");
    }

    out.push("");
    out.push(`_Totals:_ **${allSubjects.length}** subject(s), **${grandPyqCount}** PYQ(s), **${grandQuestionCount}** question(s) extracted.`);

    fs.writeFileSync(outFile, out.join("\n"), "utf8");
    console.log(`✅ Wrote dump to ${outFile}`);
    console.log(`   ${allSubjects.length} subject(s), ${grandPyqCount} PYQ(s), ${grandQuestionCount} question(s)`);

    await mongoose.disconnect();
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
});
