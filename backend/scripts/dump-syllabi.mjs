// Dump every SemesterSubject's raw OCR text + structured modules/topics to a markdown file.
// Run from backend/ with: node scripts/dump-syllabi.mjs
//
// Output: syllabus-dump-YYYYMMDD-HHMMSS.md in the backend/ directory.

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

    const docs = await mongoose.connection
        .collection("semestersubjects")
        .find({})
        .sort({ semester: 1, subject: 1 })
        .toArray();

    if (docs.length === 0) {
        console.log("No SemesterSubject entries found.");
        await mongoose.disconnect();
        process.exit(0);
    }

    const stamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .slice(0, 19);
    const outFile = path.resolve(process.cwd(), `syllabus-dump-${stamp}.md`);

    const out = [];
    out.push(`# Syllabus dump`);
    out.push(`Generated: ${new Date().toISOString()}`);
    out.push(`Total entries: ${docs.length}`);
    out.push("");

    for (const d of docs) {
        const header = `## Sem ${d.semester} — ${d.subject}${d.subjectCode ? ` (${d.subjectCode})` : ""}`;
        out.push(header);
        out.push("");
        out.push(`- **_id:** \`${d._id}\``);
        out.push(`- **Branch:** ${d.branch || "—"}`);
        out.push(`- **Status:** ${d.syllabusStatus || "no syllabus"}`);
        out.push(`- **File:** ${d.syllabusFileName || "—"}`);
        out.push(`- **File URL:** ${d.syllabusFileUrl || "—"}`);
        out.push(`- **Created:** ${d.createdAt ? new Date(d.createdAt).toISOString() : "—"}`);
        out.push(`- **Updated:** ${d.updatedAt ? new Date(d.updatedAt).toISOString() : "—"}`);
        out.push("");

        // Structured modules
        const modules = d.syllabusStructured?.modules || [];
        if (modules.length > 0) {
            out.push(`### Structured modules (${modules.length})`);
            out.push("");
            for (const m of modules) {
                out.push(`#### ${m.name}${m.title ? ` — ${m.title}` : ""}`);
                if (Array.isArray(m.topics) && m.topics.length > 0) {
                    for (const t of m.topics) out.push(`- ${t}`);
                } else {
                    out.push(`_(no topics)_`);
                }
                out.push("");
            }
        } else {
            out.push(`### Structured modules`);
            out.push(`_(none — Gemini structuring hasn't succeeded for this subject yet)_`);
            out.push("");
        }

        // Course outcomes
        const cos = d.syllabusStructured?.courseOutcomes || [];
        if (cos.length > 0) {
            out.push(`### Course outcomes`);
            for (const c of cos) out.push(`- ${c}`);
            out.push("");
        }

        // Textbooks
        const tbs = d.syllabusStructured?.textbooks || [];
        if (tbs.length > 0) {
            out.push(`### Textbooks`);
            for (const t of tbs) out.push(`- ${t}`);
            out.push("");
        }

        // Raw OCR
        if (d.syllabusText) {
            out.push(`### Raw OCR text (${d.syllabusText.length} chars)`);
            out.push("```");
            out.push(d.syllabusText);
            out.push("```");
            out.push("");
        } else {
            out.push(`### Raw OCR text`);
            out.push(`_(empty — OCR didn't run or produced nothing)_`);
            out.push("");
        }

        out.push("---");
        out.push("");
    }

    fs.writeFileSync(outFile, out.join("\n"), "utf8");
    console.log(`✅ Wrote ${docs.length} subject(s) to ${outFile}`);

    await mongoose.disconnect();
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
});
