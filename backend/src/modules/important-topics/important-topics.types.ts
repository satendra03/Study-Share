export interface ImportantTopic {
    name: string;
    importance: number; // 1-10
    frequency: number; // count across PYQs
    category: "high-frequency" | "syllabus-core" | "concept" | "other";
    reason: string;
    sampleQuestions: string[];
}

export interface ImportantTopicsResult {
    semester: string;
    subject: string;
    pyqCount: number;
    hasSyllabus: boolean;
    topics: ImportantTopic[];
}
