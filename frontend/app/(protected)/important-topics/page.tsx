"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { WorkspaceGridBackdrop } from "@/components/WorkspaceGridBackdrop";
import { SEMESTERS } from "@/lib/constants";
import {
  Sparkles,
  Loader2,
  ChevronDown,
  Flame,
  BookOpen,
  Brain,
  Lightbulb,
  ArrowLeft,
  X,
  ListChecks,
  Repeat,
  Layers,
  GitBranch,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

type SubjectOption = {
  _id: string;
  semester: string;
  subject: string;
  subjectCode?: string;
};

type Topic = {
  name: string;
  importance: number;
  frequency: number;
  category: "high-frequency" | "syllabus-core" | "concept" | "other";
  reason: string;
  sampleQuestions: string[];
};

type ExtractResult = {
  semester: string;
  subject: string;
  pyqCount: number;
  hasSyllabus: boolean;
  topics: Topic[];
};

type ModuleTopic = {
  name: string;
  importance: number;
  frequency: number;
  reason: string;
  sampleQuestions: string[];
};

type ModuleWiseResult = {
  semester: string;
  subject: string;
  pyqCount: number;
  hasSyllabus: boolean;
  modules: Array<{ name: string; title: string; topics: ModuleTopic[] }>;
};

type MindMapTopic = {
  order: number;
  name: string;
  note: string;
};

type MindMapModule = {
  order: number;
  name: string;
  title: string;
  topics: MindMapTopic[];
};

type MindMapResult = {
  semester: string;
  subject: string;
  pyqCount: number;
  hasSyllabus: boolean;
  modules: MindMapModule[];
};

type ViewMode = "overall" | "modulewise" | "mindmap";

function FormDropdown({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select",
  disabled = false,
}: {
  label?: string;
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const preventCloseRef = useRef(false);
  const display = value
    ? options.find((o) => o.value === value)?.label || value
    : placeholder;

  return (
    <div>
      {label && (
        <Label className="text-gray-300 font-medium mb-2 block">{label}</Label>
      )}
      <DropdownMenu
        open={open}
        onOpenChange={(next) => {
          if (!next && preventCloseRef.current) {
            preventCloseRef.current = false;
            return;
          }
          if (!disabled) setOpen(next);
        }}
      >
        <DropdownMenuTrigger
          disabled={disabled}
          className={`inline-flex items-center justify-between w-full cursor-pointer bg-[#12121a] border border-white/10 rounded-xl px-3 h-11 text-sm hover:bg-[#16162a] transition-colors focus:outline-none focus:border-[#5C55F9]/50 select-none ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <span className={value ? "text-white" : "text-gray-500"}>{display}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#0c0c14] border-white/10 min-w-[200px] max-h-[280px] overflow-y-auto">
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(v) => {
              preventCloseRef.current = true;
              onValueChange(v);
            }}
          >
            {options.map((opt) => (
              <DropdownMenuRadioItem
                key={opt.value}
                value={opt.value}
                className="text-gray-300 cursor-pointer focus:bg-[#5C55F9]/10 focus:text-white"
              >
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function categoryStyle(c: Topic["category"]) {
  switch (c) {
    case "high-frequency":
      return {
        chip: "bg-red-500/10 text-red-400 border-red-500/20",
        icon: <Flame className="w-3 h-3" />,
        label: "High frequency",
      };
    case "syllabus-core":
      return {
        chip: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icon: <BookOpen className="w-3 h-3" />,
        label: "Syllabus core",
      };
    case "concept":
      return {
        chip: "bg-[#5C55F9]/15 text-[#b4afff] border-[#5C55F9]/30",
        icon: <Brain className="w-3 h-3" />,
        label: "Concept",
      };
    default:
      return {
        chip: "bg-white/5 text-gray-400 border-white/10",
        icon: <Lightbulb className="w-3 h-3" />,
        label: "Other",
      };
  }
}

export default function ImportantTopicsPage() {
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [mode, setMode] = useState<ViewMode>("overall");
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [moduleResult, setModuleResult] = useState<ModuleWiseResult | null>(null);
  const [mindMap, setMindMap] = useState<MindMapResult | null>(null);
  const [error, setError] = useState("");

  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [answering, setAnswering] = useState(false);

  const resetAllResults = () => {
    setResult(null);
    setModuleResult(null);
    setMindMap(null);
    setActiveTopic(null);
    setAnswer("");
  };

  // Fetch subjects when semester changes
  useEffect(() => {
    if (!semester) {
      setSubjects([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingSubjects(true);
      try {
        const res = await api.get("/semester-subjects", {
          params: { semester },
        });
        if (!cancelled) setSubjects(res.data.data || []);
      } catch {
        if (!cancelled) setSubjects([]);
      } finally {
        if (!cancelled) setLoadingSubjects(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [semester]);

  const onExtract = async () => {
    if (!semester || !subject) {
      setError("Please pick a semester and subject first.");
      return;
    }
    setError("");
    resetAllResults();
    setExtracting(true);
    try {
      const endpoint =
        mode === "overall"
          ? "/important-topics/extract"
          : mode === "modulewise"
          ? "/important-topics/extract-modulewise"
          : "/important-topics/mindmap";

      const res = await api.post(endpoint, { semester, subject });
      if (mode === "overall") setResult(res.data.data);
      else if (mode === "modulewise") setModuleResult(res.data.data);
      else setMindMap(res.data.data);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          `Failed to generate ${
            mode === "mindmap" ? "mind map" : "topics"
          }.`
      );
    } finally {
      setExtracting(false);
    }
  };

  const onTopicClick = async (topicName: string) => {
    setActiveTopic(topicName);
    setAnswer("");
    setAnswering(true);
    try {
      const res = await api.post("/important-topics/answer", {
        topic: topicName,
        semester,
        subject,
      });
      setAnswer(res.data.data.answer || "");
    } catch (e: any) {
      setAnswer(
        `**Error:** ${e?.response?.data?.message || "Failed to generate answer."}`
      );
    } finally {
      setAnswering(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-white antialiased">
      <WorkspaceGridBackdrop />

      <div className="relative z-10 px-6 md:px-10 pt-10 pb-16 max-w-5xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to library
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 text-[#5C55F9] mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              AI Insights
            </span>
          </div>
          <h1 className="text-4xl font-medium tracking-tight">
            Important Topics
          </h1>
          <p className="mt-2 text-gray-400 font-light max-w-2xl">
            Pick your semester and subject. We&apos;ll mine years of past papers
            and the official syllabus to surface the topics most likely to show
            up in your exam — then turn any topic into an exam-ready answer with
            one click.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {([
            { id: "overall", icon: <Sparkles className="w-3.5 h-3.5" />, label: "Overall", hint: "short prep" },
            { id: "modulewise", icon: <Layers className="w-3.5 h-3.5" />, label: "By Module", hint: "module-by-module prep" },
            { id: "mindmap", icon: <GitBranch className="w-3.5 h-3.5" />, label: "Mind Map", hint: "learning roadmap" },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                if (mode !== t.id) {
                  setMode(t.id);
                  resetAllResults();
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                mode === t.id
                  ? "bg-[#5C55F9]/15 border-[#5C55F9]/40 text-[#b4afff]"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
              }`}
            >
              {t.icon}
              {t.label}
              <span className="text-[10px] opacity-70 hidden sm:inline">· {t.hint}</span>
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0c0c10]/80 backdrop-blur-md p-5 md:p-6 mb-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <FormDropdown
              label="Semester"
              value={semester}
              onValueChange={(v) => {
                setSemester(v);
                setSubject("");
                resetAllResults();
              }}
              options={SEMESTERS.map((s) => ({ value: s, label: `Sem ${s}` }))}
              placeholder="Select semester"
            />
            <FormDropdown
              label="Subject"
              value={subject}
              onValueChange={setSubject}
              options={subjects.map((s) => ({
                value: s.subject,
                label: s.subjectCode
                  ? `${s.subject} (${s.subjectCode})`
                  : s.subject,
              }))}
              placeholder={
                !semester
                  ? "Select semester first"
                  : loadingSubjects
                  ? "Loading…"
                  : subjects.length === 0
                  ? "No subjects available"
                  : "Select subject"
              }
              disabled={!semester || loadingSubjects || subjects.length === 0}
            />
            <button
              onClick={onExtract}
              disabled={extracting || !semester || !subject}
              className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-[#5C55F9] hover:bg-[#4d46db] text-white text-sm font-medium px-5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {extracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analysing…
                </>
              ) : mode === "mindmap" ? (
                <>
                  <GitBranch className="w-4 h-4" />
                  Build mind map
                </>
              ) : mode === "modulewise" ? (
                <>
                  <Layers className="w-4 h-4" />
                  Topics by module
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Find important topics
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
              <X className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Topics list (Overall mode) */}
        {mode === "overall" && result && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <ListChecks className="w-4 h-4 text-[#b4afff]" />
                <span>
                  {result.topics.length} topics for{" "}
                  <span className="text-white font-medium">
                    {result.subject}
                  </span>
                  , Sem {result.semester}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400">
                  {result.pyqCount} PYQ{result.pyqCount === 1 ? "" : "s"} indexed
                </span>
                <span
                  className={`px-2 py-1 rounded-lg border ${
                    result.hasSyllabus
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {result.hasSyllabus
                    ? "Syllabus available"
                    : "No syllabus on file"}
                </span>
              </div>
            </div>

            {result.topics.length === 0 ? (
              <div className="text-center py-16 text-gray-500 border border-dashed border-white/10 rounded-3xl">
                <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>
                  We couldn&apos;t extract topics yet. Make sure PYQs for this
                  subject are uploaded and processed.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.topics.map((t) => {
                  const cat = categoryStyle(t.category);
                  const isActive = activeTopic === t.name;
                  return (
                    <button
                      key={t.name}
                      onClick={() => onTopicClick(t.name)}
                      className={`text-left rounded-2xl border p-4 transition-all hover:border-[#5C55F9]/40 hover:bg-white/3 ${
                        isActive
                          ? "border-[#5C55F9]/60 bg-[#5C55F9]/5"
                          : "border-white/8 bg-[#0c0c14]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-base font-medium text-white leading-snug">
                          {t.name}
                        </h3>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                            Importance
                          </span>
                          <span className="text-base font-semibold text-[#b4afff]">
                            {t.importance}/10
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium border ${cat.chip}`}
                        >
                          {cat.icon}
                          {cat.label}
                        </span>
                        {t.frequency > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-white/5 text-gray-400 border border-white/10">
                            <Repeat className="w-3 h-3" />
                            {t.frequency}× in PYQs
                          </span>
                        )}
                      </div>

                      {t.reason && (
                        <p className="text-xs text-gray-400 leading-relaxed mb-2">
                          {t.reason}
                        </p>
                      )}

                      {t.sampleQuestions.length > 0 && (
                        <ul className="space-y-1 mt-2">
                          {t.sampleQuestions.slice(0, 2).map((q, i) => (
                            <li
                              key={i}
                              className="text-[11px] text-gray-500 leading-snug pl-3 relative before:absolute before:left-0 before:top-1.5 before:w-1 before:h-1 before:rounded-full before:bg-[#5C55F9]/60"
                            >
                              {q}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-3 pt-3 border-t border-white/6 text-[11px] text-[#b4afff] font-medium">
                        {isActive
                          ? "↓ See answer below"
                          : "Tap to generate exam answer →"}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Module-wise view */}
        {mode === "modulewise" && moduleResult && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Layers className="w-4 h-4 text-[#b4afff]" />
                <span>
                  {moduleResult.modules.length} module{moduleResult.modules.length === 1 ? "" : "s"} for{" "}
                  <span className="text-white font-medium">{moduleResult.subject}</span>, Sem {moduleResult.semester}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400">
                  {moduleResult.pyqCount} PYQ{moduleResult.pyqCount === 1 ? "" : "s"} indexed
                </span>
                <span className={`px-2 py-1 rounded-lg border ${moduleResult.hasSyllabus ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                  {moduleResult.hasSyllabus ? "Syllabus available" : "No syllabus on file"}
                </span>
              </div>
            </div>

            {moduleResult.modules.length === 0 ? (
              <div className="text-center py-16 text-gray-500 border border-dashed border-white/10 rounded-3xl">
                <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No modules extracted. Add a syllabus so we know the module boundaries.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {moduleResult.modules.map((mod, mi) => (
                  <div key={mi} className="rounded-3xl border border-white/10 bg-[#0c0c10]/80 backdrop-blur-md p-5">
                    <div className="flex items-baseline justify-between gap-3 mb-4 pb-3 border-b border-white/8">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#7a73f5] font-semibold mb-1">{mod.name}</p>
                        <h2 className="text-lg font-semibold text-white">{mod.title || mod.name}</h2>
                      </div>
                      <span className="text-xs text-gray-500">{mod.topics.length} topic{mod.topics.length === 1 ? "" : "s"}</span>
                    </div>

                    {mod.topics.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No specific topics identified for this module yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {mod.topics.map((t, ti) => {
                          const isActive = activeTopic === t.name;
                          return (
                            <button
                              key={ti}
                              onClick={() => onTopicClick(t.name)}
                              className={`text-left rounded-2xl border p-4 transition-all hover:border-[#5C55F9]/40 hover:bg-white/3 ${isActive ? "border-[#5C55F9]/60 bg-[#5C55F9]/5" : "border-white/8 bg-[#0c0c14]"}`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className="text-sm font-medium text-white leading-snug">{t.name}</h3>
                                <span className="text-xs font-semibold text-[#b4afff] shrink-0">{t.importance}/10</span>
                              </div>
                              {t.frequency > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white/5 text-gray-400 border border-white/10 mb-2">
                                  <Repeat className="w-3 h-3" />
                                  {t.frequency}× in PYQs
                                </span>
                              )}
                              {t.reason && <p className="text-xs text-gray-400 leading-relaxed mt-1">{t.reason}</p>}
                              <div className="mt-3 pt-2 border-t border-white/6 text-[11px] text-[#b4afff] font-medium">
                                {isActive ? "↓ See answer below" : "Tap for exam answer →"}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mind Map — syllabus-driven, every topic sequenced inside each module */}
        {mode === "mindmap" && mindMap && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <GitBranch className="w-4 h-4 text-[#b4afff]" />
                <span>
                  {mindMap.modules.length} module{mindMap.modules.length === 1 ? "" : "s"} ·{" "}
                  {mindMap.modules.reduce((n, m) => n + m.topics.length, 0)} topics total for{" "}
                  <span className="text-white font-medium">{mindMap.subject}</span>, Sem {mindMap.semester}
                </span>
              </div>
            </div>

            {mindMap.modules.length === 0 ? (
              <div className="text-center py-16 text-gray-500 border border-dashed border-white/10 rounded-3xl">
                <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Mind map needs a structured syllabus. Ask the admin to upload and re-run the syllabus first.</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[17px] top-4 bottom-4 w-px bg-linear-to-b from-[#5C55F9]/40 via-[#5C55F9]/20 to-transparent" aria-hidden />

                <div className="space-y-5">
                  {mindMap.modules.map((mod) => (
                    <div key={mod.order} className="relative pl-12">
                      <div className="absolute left-0 top-0 w-9 h-9 rounded-xl bg-[#5C55F9]/15 border border-[#5C55F9]/40 flex items-center justify-center text-sm font-bold text-[#b4afff]">
                        {mod.order}
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-[#0c0c10]/80 backdrop-blur-md p-5">
                        <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#7a73f5] font-semibold mb-1">{mod.name}</p>
                            <h3 className="text-lg font-semibold text-white">{mod.title || mod.name}</h3>
                          </div>
                          <span className="text-xs text-gray-500">{mod.topics.length} topic{mod.topics.length === 1 ? "" : "s"}</span>
                        </div>

                        {mod.topics.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No topics listed for this module.</p>
                        ) : (
                          <div className="mt-3 space-y-1.5">
                            {mod.topics.map((t) => (
                              <button
                                key={`${mod.order}-${t.order}-${t.name}`}
                                onClick={() => onTopicClick(t.name)}
                                className={`w-full text-left flex items-start gap-2 px-3 py-2 rounded-lg border transition-colors ${
                                  activeTopic === t.name
                                    ? "border-[#5C55F9]/60 bg-[#5C55F9]/10"
                                    : "border-white/6 bg-white/3 hover:border-[#5C55F9]/40 hover:bg-[#5C55F9]/5"
                                }`}
                              >
                                <span className="text-[11px] font-semibold text-[#b4afff] shrink-0 mt-0.5 w-5 text-right">{t.order}.</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white font-medium leading-snug">{t.name}</p>
                                  {t.note && <p className="text-[11px] text-gray-500 mt-0.5">{t.note}</p>}
                                </div>
                                <span className="text-[10px] text-[#b4afff] shrink-0 mt-1">→ answer</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Answer panel */}
        {activeTopic && (
          <div className="rounded-3xl border border-white/10 bg-[#0c0c10]/80 backdrop-blur-md p-5 md:p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-white/8">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#7a73f5] font-semibold mb-1">
                  Exam-ready answer
                </p>
                <h2 className="text-xl font-semibold text-white">
                  {activeTopic}
                </h2>
              </div>
              <button
                onClick={() => {
                  setActiveTopic(null);
                  setAnswer("");
                }}
                className="text-gray-500 hover:text-white"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {answering ? (
              <div className="py-12 flex flex-col items-center text-gray-500 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-[#5C55F9]" />
                <p className="text-sm">Generating exam-ready notes…</p>
              </div>
            ) : answer ? (
              <div className="prose prose-invert prose-sm max-w-none text-gray-200 leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-lg font-bold mt-5 mb-2 text-[#b4afff]">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-bold mt-5 mb-2 text-[#b4afff]">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-bold mt-4 mb-2 text-white">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-3 last:mb-0 leading-relaxed text-sm text-gray-300">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc ml-5 my-2 space-y-1 text-sm text-gray-300">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal ml-5 my-2 space-y-1 text-sm text-gray-300">
                        {children}
                      </ol>
                    ),
                    code: ({ children }) => (
                      <code className="px-1 py-0.5 rounded bg-[#1a1a24] border border-white/8 text-[#b4afff] text-[12px]">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-[#070710] border border-white/8 rounded-xl p-3 overflow-x-auto text-[12px] my-3">
                        {children}
                      </pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-[#5C55F9]/40 pl-3 italic text-gray-400 my-3">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {answer}
                </ReactMarkdown>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
