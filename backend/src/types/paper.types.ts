export interface StructuredPaper {
    subject: string | null;
    subjectCode: string | null;
    branch: string | null;
    semester: string | null;        // ✅ moved to top level
    papers: YearPaper[];
    rawText: string;
}

export interface YearPaper {
    year: string | null;
    sections: Section[];
}

export interface Section {
    title: string;
    questions: string[];
}