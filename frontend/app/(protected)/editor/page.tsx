"use client";

import { useState, useRef } from "react";
import { Code2, BookOpen, ChevronRight, ChevronDown, X, Lightbulb } from "lucide-react";
import { SAMPLE_CATEGORIES, type CodeSample } from "./samples";

export default function CodeEditorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ sorting: true });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const iframeSrc = `https://onecompiler.com/embed/?theme=dark&hideTitle=true&listenToEvents=true&hideNew=true&fontSize=14`;

  const loadSample = (sample: CodeSample) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      {
        eventType: "populateCode",
        language: sample.language,
        files: [{ name: sample.filename, content: sample.code }],
      },
      "*"
    );
  };

  const toggleCategory = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#030303] text-white">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-white/6 bg-[#07070d]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5C55F9]/15 border border-[#5C55F9]/25">
            <Code2 className="h-4 w-4 text-[#b4afff]" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight leading-tight">Code Editor</h1>
            <p className="text-[11px] text-gray-500 leading-tight">Powered by OneCompiler</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ready
          </div>

          {/* Samples toggle */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              sidebarOpen
                ? "bg-[#5C55F9]/15 border-[#5C55F9]/30 text-[#b4afff]"
                : "bg-white/4 border-white/8 text-gray-400 hover:text-white hover:bg-white/6"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Samples
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 shrink-0 flex flex-col border-r border-white/6 bg-[#05050c] overflow-hidden">
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-yellow-500/80" />
                <span className="text-xs font-semibold text-gray-300 tracking-wide uppercase">Practice</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-600 hover:text-gray-400 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {SAMPLE_CATEGORIES.map((cat) => (
                <div key={cat.id} className="mb-0.5">
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-white/4 transition-colors group cursor-pointer"
                  >
                    <span className="text-[11px] font-semibold text-gray-400 group-hover:text-gray-300 uppercase tracking-wider">
                      {cat.label}
                    </span>
                    {expanded[cat.id] ? (
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-gray-600" />
                    )}
                  </button>

                  {/* Samples list */}
                  {expanded[cat.id] && (
                    <div className="pb-1">
                      {cat.samples.map((sample) => (
                        <button
                          key={sample.id}
                          onClick={() => loadSample(sample)}
                          className="w-full text-left px-4 py-2.5 hover:bg-[#5C55F9]/8 group transition-colors cursor-pointer border-l-2 border-transparent hover:border-[#5C55F9]/50 ml-0"
                        >
                          <div className="text-[12.5px] font-medium text-gray-300 group-hover:text-white transition-colors leading-tight">
                            {sample.title}
                          </div>
                          <div className="text-[11px] text-gray-600 group-hover:text-gray-500 mt-0.5 leading-tight">
                            {sample.description}
                          </div>
                          <div className="mt-1.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5C55F9]/10 text-[#9b96ff] font-mono border border-[#5C55F9]/15">
                              {sample.language}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="shrink-0 px-4 py-3 border-t border-white/6">
              <p className="text-[10.5px] text-gray-600 leading-relaxed">
                Click any sample to load it into the editor instantly.
              </p>
            </div>
          </div>
        )}

        {/* OneCompiler iframe */}
        <div className="flex-1 min-w-0">
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            className="w-full h-full block"
            allow="clipboard-read; clipboard-write"
            title="OneCompiler Code Editor"
          />
        </div>
      </div>
    </div>
  );
}
