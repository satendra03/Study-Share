"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { Play, Terminal, Loader } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANGUAGES = ["javascript", "python", "java", "cpp", "c", "typescript"];
const DEFAULT_CODE: Record<string, string> = {
  javascript: 'console.log("Hello, World!");',
  python: 'print("Hello, World!")',
  java: 'public class Main { public static void main(String[] args) { System.out.println("Hello, World!"); } }',
  cpp: '#include <iostream>\nint main() { std::cout << "Hello, World!" << std::endl; return 0; }',
  c: '#include <stdio.h>\nint main() { printf("Hello, World!\\n"); return 0; }',
  typescript: 'console.log("Hello, World!");',
};

export default function SandboxPage() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    setOutput("");
    try {
      const res = await api.post("/code/execute", { code, language });
      const result = res.data.data;
      setOutput(result?.output || result?.stdout || result?.stderr || JSON.stringify(result, null, 2));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setOutput(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleLanguageChange = (lang: string | null) => {
    if (!lang) return;
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang] || "");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Code Sandbox</h1>
          <p className="text-gray-400 text-sm mt-0.5">Write and run code in your browser</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-36 bg-gray-900 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={handleRun} disabled={running} className="bg-green-600 hover:bg-green-700">
            {running ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Run
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Editor */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <MonacoEditor
            height="100%"
            language={language === "cpp" ? "cpp" : language}
            value={code}
            onChange={v => setCode(v || "")}
            theme="vs-dark"
            options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 } }}
          />
        </div>

        {/* Output */}
        <div className="w-80 bg-gray-950 border border-gray-800 rounded-xl flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800">
            <Terminal className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">Output</span>
          </div>
          <pre className="flex-1 p-3 text-xs font-mono overflow-auto text-green-400 whitespace-pre-wrap">
            {running ? <span className="text-gray-500 animate-pulse">Running...</span> : output || <span className="text-gray-700">Press Run to execute your code</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}
