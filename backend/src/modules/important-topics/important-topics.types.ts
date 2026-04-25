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

export interface ModuleTopic {
    name: string;
    importance: number;
    frequency: number;
    reason: string;
    sampleQuestions: string[];
}

export interface ModuleWiseTopics {
    semester: string;
    subject: string;
    pyqCount: number;
    hasSyllabus: boolean;
    modules: Array<{
        name: string;
        title: string;
        topics: ModuleTopic[];
    }>;
}

export interface MindMapTopic {
    order: number;
    name: string;
    note: string; // optional 1-line hint like "builds on X", or ""
}

export interface MindMapModule {
    order: number; // which module to study first
    name: string; // e.g. "Module 1"
    title: string; // e.g. "Introduction to IoT"
    topics: MindMapTopic[];
}

export interface MindMapResult {
    semester: string;
    subject: string;
    pyqCount: number;
    hasSyllabus: boolean;
    modules: MindMapModule[];
}
