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

export const getPageStructuringPrompt = (rawText: string, pageNumber: number) => {
    return `Extract the unit/section title and a flat array of questions from the following single page text.
Fix any obvious OCR errors. Do not extract sub-parts as nested arrays, each part must be its own string in the 'questions' array.
Return ONLY a valid JSON object matching this structure exactly (no markdown, no backticks):
{ "unit": "must be one of [Module-1, Module-2, Module-3, Module-4, Module-5]", "questions": ["Question 1", "Question 2"] }

Text (Page ${pageNumber}):
${rawText}`;
}