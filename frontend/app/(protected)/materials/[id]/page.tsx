"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Material, ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, FileText, Download, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function MaterialPage() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState(1);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: material, isLoading } = useQuery<Material>({
    queryKey: ["material", id],
    queryFn: async () => {
      const res = await api.get(`/materials/${id}`);
      return res.data.data || res.data;
    },
  });

  // Fetch PDF bytes → blob URL so Content-Disposition: attachment is bypassed
  useEffect(() => {
    if (!material?.fileUrl) return;

    let url: string;
    setPdfLoading(true);
    setPdfError(false);
    setBlobUrl(null);

    fetch(material.fileUrl)
      .then(res => {
        if (!res.ok) throw new Error("fetch failed");
        return res.blob();
      })
      .then(blob => {
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        url = URL.createObjectURL(pdfBlob);
        setBlobUrl(url);
      })
      .catch(() => setPdfError(true))
      .finally(() => setPdfLoading(false));

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [material?.fileUrl]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setSending(true);
    try {
      const res = await api.post(`/materials/chat/${id}`, { message: userMsg, history: messages, pageNumber });
      const reply = res.data.data?.reply || "No response";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setSending(false);
    }
  };

  const handleDownload = () => {
    if (!material?.fileUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl || material.fileUrl;
    a.download = material.fileName || "document.pdf";
    a.click();
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      {/* PDF Viewer */}
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl flex flex-col items-center">
        {material?.fileUrl ? (
          <>
            {/* Toolbar */}
            <div className="w-full flex items-center justify-between px-3 py-2 border-b border-gray-800 shrink-0">
              <p className="text-xs text-gray-400 truncate max-w-xs">{material.year ? `Year: ${material.year}` : "Unknown Year"}</p>
              
              {/* Pagination Controls */}
              {numPages && (
                <div className="flex items-center gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    disabled={pageNumber <= 1} 
                    onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                    className="h-6 w-6 text-gray-400 shrink-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-gray-300 text-xs">
                    Page {pageNumber} of {numPages}
                  </span>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    disabled={pageNumber >= numPages} 
                    onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                    className="h-6 w-6 text-gray-400 shrink-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownload}
                className="text-gray-400 hover:text-white h-7 px-2 text-xs"
              >
                <Download className="w-3 h-3 mr-1" /> Download
              </Button>
            </div>

            {/* PDF area */}
            <div className="flex-1 w-full overflow-y-auto flex items-center justify-center hide-scrollbar">
              {pdfLoading && (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-2" />
                  <span className="text-gray-400 text-sm">Loading PDF...</span>
                </div>
              )}

              {!pdfLoading && blobUrl && (
                <Document
                  file={blobUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={() => setPdfError(true)}
                  loading={
                    <div className="flex flex-col items-center justify-center pt-20">
                      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-2" />
                      <span className="text-gray-400 text-sm">Rendering document...</span>
                    </div>
                  }
                >
                  <Page 
                    pageNumber={pageNumber} 
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    width={typeof window !== "undefined" ? Math.min(window.innerWidth * 0.5, 800) : 600}
                    className="shadow-xl"
                  />
                </Document>
              )}

              {!pdfLoading && pdfError && (
                <div className="flex flex-col items-center justify-center gap-4 text-gray-500 m-auto">
                  <FileText className="w-12 h-12 opacity-30" />
                  <p className="text-sm">Could not load PDF preview.</p>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>No file available</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Sidebar */}
      <div className="w-80 flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-white">Chat with Document</h3>
          <p className="text-xs text-gray-500 truncate">{material?.year ? `Year: ${material.year}` : "Unknown Year"}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-gray-600 text-xs mt-8">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Ask anything about this document</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "user" ? "bg-indigo-600" : "bg-gray-700"
              }`}>
                {msg.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              </div>
              <div className={`rounded-xl px-3 py-2 text-xs max-w-[85%] ${
                msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-200"
              }`}>
                {msg.role === "user" ? msg.content : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                      h1: ({ children }) => <h1 className="text-sm font-bold mt-2 mb-1">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm font-bold mt-2 mb-1">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xs font-bold mt-1.5 mb-0.5">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-1 space-y-0.5">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-1 space-y-0.5">{children}</ol>,
                      li: ({ children }) => <li className="text-xs">{children}</li>,
                      code: ({ children, className }) => className
                        ? <pre className="bg-gray-900 rounded p-2 text-xs overflow-x-auto my-1"><code>{children}</code></pre>
                        : <code className="bg-gray-900 px-1 rounded text-indigo-300">{children}</code>,
                      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                      hr: () => <hr className="border-gray-600 my-2" />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3" />
              </div>
              <div className="bg-gray-800 rounded-xl px-3 py-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="p-3 border-t border-gray-800 flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask a question..."
            className="text-xs bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
          <Button size="sm" onClick={sendMessage} disabled={sending || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 px-2">
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
