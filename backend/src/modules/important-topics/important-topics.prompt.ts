export const getImportantTopicsPrompt = (
    subject: string,
    semester: string,
    syllabusText: string,
    pyqCombinedText: string
) => {
    const syllabusBlock = syllabusText
        ? `=== OFFICIAL SYLLABUS ===\n${syllabusText}\n=== END SYLLABUS ===`
        : `=== OFFICIAL SYLLABUS ===\n(none provided)\n=== END SYLLABUS ===`;

    return `You are an expert academic exam analyst.

Your task: Analyse the syllabus AND multiple Previous Year Question Papers (PYQs) for "${subject}" (Semester ${semester}) and produce a curated list of the MOST IMPORTANT topics a student should study before the exam.

Inputs:
${syllabusBlock}

=== PYQ QUESTIONS (multiple years combined) ===
${pyqCombinedText}
=== END PYQ ===

Rules for selecting topics:
1. Prefer topics that REPEAT across years — those are guaranteed exam material.
2. Include syllabus topics that appear at least once in PYQs.
3. Each topic should be a SPECIFIC concept (e.g. "Binary Search Tree", "Process Synchronization"), NOT a whole module.
4. Cap the list at 12 topics. Sort by importance descending.
5. importance = 1..10 score (10 = appears every year, very high marks).
6. frequency = how many times the topic appears in the PYQs (estimate).
7. category = one of: "high-frequency" (≥3 occurrences), "syllabus-core" (in syllabus + at least 1 PYQ), "concept" (general important concept), "other".
8. reason = 1 short sentence on why this topic matters (e.g. "Asked in 4 of last 5 years").
9. sampleQuestions = up to 3 short paraphrased question stems pulled from the PYQs (clean, single-line, no "Q.1(a)" prefixes).
10. If syllabus is missing, rely on PYQ frequency only.

Return ONLY a JSON object — no markdown, no code fences, no commentary.

Schema:
{
  "topics": [
    {
      "name": "string (specific topic name)",
      "importance": number (1-10),
      "frequency": number,
      "category": "high-frequency" | "syllabus-core" | "concept" | "other",
      "reason": "string (1 short sentence)",
      "sampleQuestions": ["string", "string"]
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
