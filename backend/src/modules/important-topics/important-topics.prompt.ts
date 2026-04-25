export const getImportantTopicsPrompt = (
    subject: string,
    semester: string,
    syllabusText: string,
    pyqCombinedText: string,
    pyqYears: string[]
) => {
    const syllabusBlock = syllabusText
        ? `=== OFFICIAL SYLLABUS ===\n${syllabusText}\n=== END SYLLABUS ===`
        : `=== OFFICIAL SYLLABUS ===\n(none provided)\n=== END SYLLABUS ===`;

    const yearsSummary = pyqYears.length > 0
        ? `We have ${pyqYears.length} PYQ paper(s) covering years: ${pyqYears.join(", ")}.`
        : `We have 0 PYQ papers.`;

    const topicCap = Math.max(15, Math.min(25, 12 + pyqYears.length * 3));

    return `You are an expert academic exam analyst.

Your task: Analyse the syllabus AND Previous Year Question Papers (PYQs) for "${subject}" (Semester ${semester}) and produce a curated list of the MOST IMPORTANT topics a student should study before the exam.

${yearsSummary}

Inputs:
${syllabusBlock}

=== PYQ QUESTIONS ===
${pyqCombinedText}
=== END PYQ ===

CRITICAL TRUTHFULNESS RULES (these override anything else):
- NEVER invent years or frequencies that aren't supported by the data above.
- We have ONLY the years listed above (${pyqYears.length > 0 ? pyqYears.join(", ") : "none"}). Do NOT refer to "last 5 years" or "4 years" if those years don't exist in the data.
- frequency = the REAL count of how many times the topic appears across the papers above. Never exceed ${pyqYears.length || 1}.
- If a topic appears in every paper we have, say "Asked in all ${pyqYears.length || 0} paper(s) we have" — NOT "every year".
- If we only have 2 papers, don't write "4 of last 5 years" — be honest and say "asked in both papers" or "in 1 of 2 papers".

Rules for selecting topics:
1. Prefer topics that repeat across the PYQs we actually have.
2. Include syllabus topics even if they appear only once in PYQs (they're likely to repeat).
3. Each topic should be a SPECIFIC concept (e.g. "Binary Search Tree", "Process Synchronization"), not a whole module.
4. Aim for ${topicCap} topics, but fewer is fine if there aren't that many distinct concepts. Sort by importance desc.
5. importance = 1..10 score. Topics in every PYQ we have + in syllabus = 10. Only in syllabus, never in PYQs = 4-6. Only in one PYQ, not syllabus = 3-5.
6. frequency = actual occurrence count across the ${pyqYears.length || 0} paper(s) above. Must be an integer between 0 and ${pyqYears.length || 1}.
7. category = one of: "high-frequency" (topic appears in ≥2 papers we have), "syllabus-core" (in syllabus + at least 1 PYQ), "concept" (important concept only in syllabus), "other".
8. reason = 1 short sentence grounded in the actual data (e.g. "Asked in both ${pyqYears.slice(0, 2).join(" and ") || "papers"}", "In syllabus, asked in ${pyqYears[0] || "the recent paper"}"). No fabricated year counts.
9. sampleQuestions = up to 3 short question stems pulled verbatim-ish from the PYQ text above. If the topic isn't in any PYQ, leave this empty.
10. If no syllabus, rely on PYQ frequency only. If no PYQs, rely on syllabus + your knowledge of the subject.

Return ONLY a JSON object — no markdown, no code fences, no commentary.

Schema:
{
  "topics": [
    {
      "name": "string (specific topic name)",
      "importance": number (1-10),
      "frequency": number (0 to ${pyqYears.length || 1}),
      "category": "high-frequency" | "syllabus-core" | "concept" | "other",
      "reason": "string (1 short sentence grounded in the actual years/papers available)",
      "sampleQuestions": ["string"]
    }
  ]
}`;
};

export const getModuleWiseTopicsPrompt = (
    subject: string,
    semester: string,
    syllabusText: string,
    pyqCombinedText: string,
    pyqYears: string[]
) => {
    const syllabusBlock = syllabusText
        ? `=== OFFICIAL SYLLABUS (module-structured) ===\n${syllabusText}\n=== END SYLLABUS ===`
        : `=== OFFICIAL SYLLABUS ===\n(none provided — infer modules from PYQ structure)\n=== END SYLLABUS ===`;

    const yearsSummary = pyqYears.length > 0
        ? `We have ${pyqYears.length} PYQ paper(s) covering years: ${pyqYears.join(", ")}.`
        : `We have 0 PYQ papers.`;

    return `You are an expert academic exam analyst.

Task: For "${subject}" (Semester ${semester}), break down the MOST IMPORTANT topics PER MODULE, so a student can prepare module by module.

${yearsSummary}

${syllabusBlock}

=== PYQ QUESTIONS ===
${pyqCombinedText}
=== END PYQ ===

CRITICAL TRUTHFULNESS:
- Only reference years we actually have: ${pyqYears.length > 0 ? pyqYears.join(", ") : "(none)"}. Never invent years.
- frequency for any topic must be between 0 and ${pyqYears.length || 1}.

Rules:
1. Use the syllabus module structure above as-is. Keep module names exactly as they appear in the syllabus.
2. If syllabus modules are missing, infer 3-6 modules from the PYQ content.
3. Per module, list the 4-8 topics from that module most likely to appear in the exam.
4. A topic goes under the module it belongs to in the syllabus. If ambiguous, choose the best fit.
5. importance = 1..10 (10 = in every PYQ we have + syllabus).
6. reason = 1 grounded sentence referencing real years (e.g. "Asked in ${pyqYears[0] || "recent paper"}, in syllabus module X").

Return ONLY JSON — no markdown or commentary.

Schema:
{
  "modules": [
    {
      "name": "string (module label, e.g. 'Module 1')",
      "title": "string (module title/heading, or empty)",
      "topics": [
        {
          "name": "string (specific concept)",
          "importance": number (1-10),
          "frequency": number (0 to ${pyqYears.length || 1}),
          "reason": "string",
          "sampleQuestions": ["string"]
        }
      ]
    }
  ]
}`;
};

export const getMindMapPrompt = (
    subject: string,
    semester: string,
    syllabusModulesJson: string
) => {
    return `You are a curriculum designer. For "${subject}" (Semester ${semester}), take the syllabus modules below and produce a LEARNING SEQUENCE.

The student wants to know, inside each module, WHICH TOPIC TO READ FIRST and why.

=== SYLLABUS MODULES (exact list) ===
${syllabusModulesJson}
=== END SYLLABUS ===

STRICT RULES (do not violate):
1. Keep EVERY module from the input. Do not add, merge, rename, or skip modules.
2. Keep EVERY topic in each module. Do not invent new topics. Do not drop any. Do not rename topics.
3. Only reorder topics WITHIN each module so the sequence goes from foundational → advanced. The idea: if topic B builds on topic A, list A first.
4. Module order may be preserved (syllabus order) OR reordered if the second module is actually a prerequisite for the first — use your judgement but keep it close to syllabus order.
5. For each topic, add a very short "note" (1 line, max ~12 words) saying why it's placed there. Examples: "foundation — start here", "builds on definition", "needs ch.3 concepts", "applied layer". If nothing useful to say, leave note as "".
6. Output MUST contain the same total topic count as the input.

Return ONLY JSON — no markdown, no commentary.

Schema:
{
  "modules": [
    {
      "order": number (1 = study first),
      "name": "string (module label exactly as in input, e.g. 'Module 1')",
      "title": "string (module title as in input)",
      "topics": [
        {
          "order": number (1 = read first within this module),
          "name": "string (exact topic name from input)",
          "note": "string (<=12 words or empty)"
        }
      ]
    }
  ]
}`;
};

export const getTopicAnswerPrompt = (
    topic: string,
    subject: string,
    semester: string,
    syllabusText: string,
    pyqContext: string
) => {
    const syllabusBlock = syllabusText
        ? `Relevant syllabus excerpt:\n${syllabusText.slice(0, 8000)}`
        : "";
    const pyqBlock = pyqContext
        ? `Sample exam questions on this topic:\n${pyqContext.slice(0, 8000)}`
        : "";

    return `You are StudyShare AI — generating an exam-ready, structured study note for the topic below.

Subject: ${subject}
Semester: ${semester}
Topic: ${topic}

${syllabusBlock}

${pyqBlock}

Produce a complete, exam-ready answer covering:
1. **Definition** — crisp 1-2 line definition.
2. **Key concepts** — bullet points of the main sub-ideas.
3. **Working / explanation** — step-by-step or diagrammatic where useful (use markdown).
4. **Examples / formulas** — at least one concrete example or formula if applicable.
5. **Likely exam questions** — 3 short past-style questions that could be asked.
6. **Quick revision summary** — 3-4 lines a student can memorise.

Format with proper markdown headings, bullets, and code/math blocks where useful. Be precise, not verbose.`;
};
