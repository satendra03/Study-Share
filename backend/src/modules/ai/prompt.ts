export const getStructurePrompt = (text: string) => {
    return `You are a question paper parser. This document may contain question papers from MULTIPLE YEARS combined in one PDF.
  
  Return ONLY a JSON object, no explanation, no markdown, no code fences.
  
  Schema:
  {
    "subject": "full subject name or null",
    "subjectCode": "subject/paper code e.g. EC-37 or null",
    "branch": "short branch code e.g. CS, EC, ME, CE, IT or null",
    "semester": "semester as digit string e.g. 6 for VI sem — common across all years, or null",
    "papers": [
      {
        "year": "4-digit exam year e.g. 2019 or null",
        "sections": [
          {
            "title": "section/unit name e.g. UNIT-I, Module-I, or empty string if none",
            "questions": [
              "full question text as a single clean string"
            ]
          }
        ]
      }
    ]
  }
  
  Rules:
  - CRITICAL: If the document contains papers from multiple years, create a SEPARATE entry in papers[] for EACH year — do NOT mix questions from different years
  - Each sub-part (a), (b), (c) becomes its own SEPARATE entry in the questions array
  - Drop question labels like Q.1(a) — keep only the question text itself
  - Fix obvious OCR errors (e.g. "tbe" → "the")
  - Preserve all technical terms, numbers, and formulas exactly
  - Ignore page numbers, footers, institute names, watermarks, phone numbers, addresses
  - For branch: infer from department name if not explicit ("Computer Science" → "CS", "Electronics" → "EC", "Information Technology" → "IT")
  - For semester: convert roman numerals to digit ("VI Sem" → "6") — use the same value for all years
  - If no sections exist within a year, use one section entry with "title": ""
  - Return ONLY the JSON, nothing else
  
  Raw text:
  ${text}`;
  }

export const getPageStructuringPrompt = (rawText: string, pageNumber: number, subject?: string | null) => {
    const subjectHint = subject ? `This page is from a "${subject}" exam paper. Use this subject context to resolve any unclear OCR words (e.g. if a word looks like "Binory Trse" and the subject is Data Structures, it is likely "Binary Tree").` : "";

    return `You are extracting questions from a single page of an engineering exam paper.
${subjectHint}

IMPORTANT: A single page may contain questions from MORE THAN ONE module/unit. Group questions by their module heading.

RULES:
- Scan the page for module/unit headings (e.g. "Module 1", "Module-2", "UNIT-III"). Each heading starts a new group.
- If the page has no module heading at all, use "Module-1" as the default group.
- Extract every question exactly as written — do NOT rephrase, summarize, or rewrite.
- Only fix obvious OCR character errors (e.g. "Expiain" → "Explain", "tbe" → "the", "iist" → "list"). Keep the rest of the question text untouched.
- Each sub-part (a), (b), (c) must be a separate entry in the questions array. Drop labels like "1a." or "Q.1(a)" — keep only the question text.
- If the page is a cover page, blank page, or has no questions, return an empty groups array.
- Return ONLY valid JSON — no markdown, no backticks, no explanation.

Output structure:
{ "groups": [ { "unit": "Module-N", "questions": ["question 1", "question 2"] } ] }

Example (page with TWO modules):
Input: "Module 1  1a. Explain stack with example. 1b. Write program for queue.  Module 2  2a. Expiain binory search tree."
Output: { "groups": [ { "unit": "Module-1", "questions": ["Explain stack with example.", "Write program for queue."] }, { "unit": "Module-2", "questions": ["Explain binary search tree."] } ] }

Example (page with ONE module):
Input: "Module 3 - Trees  1a. Expiain binory search tree with exampie. 10M  1b. Wrlte a C progrm to implement inorder traversal."
Output: { "groups": [ { "unit": "Module-3", "questions": ["Explain binary search tree with example.", "Write a C program to implement inorder traversal."] } ] }

Text (Page ${pageNumber}):
${rawText}`;
}