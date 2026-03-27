"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Code2, AlertTriangle, Settings, Box, RefreshCw } from "lucide-react";

// Best effort versions for Piston executor
const LANGUAGE_VERSIONS: Record<string, string> = {
  javascript: "18.15.0",
  typescript: "5.0.3",
  python: "3.10.0",
  cpp: "10.2.0",
};

const CODE_SNIPPETS: Record<string, string> = {
  javascript: `function greet(name) {\n  console.log("Hello, " + name + "!");\n}\n\ngreet("World");\n`,
  typescript: `interface User {\n  name: string;\n  id: number;\n}\n\nconst user: User = {\n  name: "StudyShare",\n  id: 1\n};\n\nconsole.log(user);\n`,
  python: `def greet(name):\n    print(f"Hello, {name}!")\n\ngreet("World")\n`,
  cpp: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n`,
};

export default function CodeEditorPage() {
  const [language, setLanguage] = useState<string>("javascript");
  const [code, setCode] = useState<string>(CODE_SNIPPETS["javascript"]);
  const [output, setOutput] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(CODE_SNIPPETS[lang]);
    setOutput("");
  };

  const executeCode = async () => {
    setIsExecuting(true);
    setOutput("");
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: language,
          version: LANGUAGE_VERSIONS[language],
          files: [
            {
              content: code,
            },
          ],
        }),
      });
      const result = await response.json();
      if (result.run) {
        if (result.run.stderr && !result.run.stdout) {
          setOutput("Runtime Error:\\n" + result.run.stderr);
        } else {
          setOutput(result.run.output || "Execution completed with no output.");
        }
      } else {
        setOutput(result.message || "Compilation failed. Check language version support.");
      }
    } catch (error: any) {
      setOutput("Virtual execution environment error: " + error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#030303] text-white">
      {/* Top Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0a0a0f] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Cloud IDE</h1>
            <p className="text-xs text-gray-400">Practice algorithms remotely in isolated containers.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-1">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-transparent text-sm font-medium text-gray-300 outline-none px-3 py-1.5 cursor-pointer hover:text-white"
            >
              <option value="javascript" className="bg-[#111] text-white">JavaScript (Node.js)</option>
              <option value="typescript" className="bg-[#111] text-white">TypeScript (ES6)</option>
              <option value="python" className="bg-[#111] text-white">Python 3</option>
              <option value="cpp" className="bg-[#111] text-white">C++ (GCC)</option>
            </select>
          </div>
          
          <button
            onClick={executeCode}
            disabled={isExecuting}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)] cursor-pointer"
          >
            {isExecuting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
            {isExecuting ? "Executing..." : "Run Code"}
          </button>
        </div>
      </div>

      {/* Editor & Console Split */}
      <div className="flex flex-1 min-h-0 bg-[#09090b]">
        {/* Editor Side */}
        <div className="flex-1 border-r border-white/10 flex flex-col min-w-0 h-full">
          <div className="flex shrink-0 items-center gap-2 border-b border-white/5 bg-[#0e0e12] px-4 py-2 text-xs font-medium text-gray-500">
            <Box className="h-3 w-3" />
            main.{language === "python" ? "py" : language === "cpp" ? "cpp" : language === "typescript" ? "ts" : "js"}
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineHeight: 1.6,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                formatOnPaste: true,
              }}
              loading={
                <div className="flex h-full items-center justify-center text-gray-500 text-sm gap-3">
                   <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                   Initializing Monaco Engine...
                </div>
              }
            />
          </div>
        </div>

        {/* Output Side */}
        <div className="w-[400px] flex flex-col shrink-0 bg-[#050505]">
          <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-[#0e0e12] px-4 py-2 text-xs font-medium text-gray-400">
            <Settings className="h-3 w-3" />
            Console Output
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm max-h-full">
            {isExecuting ? (
              <div className="flex items-center gap-3 text-indigo-400">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Compiling in isolated container...</span>
              </div>
            ) : output ? (
              <pre className="text-gray-300 whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                <AlertTriangle className="h-8 w-8 opacity-20" />
                <p>Compile code to view the results here.</p>
              </div>
            )}
          </div>
          
          {/* Quick Stats or info block */}
          <div className="shrink-0 border-t border-white/10 p-4 bg-[#08080a]">
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Powered by Piston Virtual Environments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
