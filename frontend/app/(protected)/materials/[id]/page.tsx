"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Material, ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, FileText, Download, Loader2, ChevronLeft, ChevronRight, Bookmark, Clock } from "lucide-react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { WorkspaceGridBackdrop } from "@/components/WorkspaceGridBackdrop";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function MaterialPage() {
  const { id } = useParams<{ id: string }>();
  const { appUser, setAppUser } = useAuthStore();
  const bookmarked = Boolean(id && appUser?.bookmarkedMaterialIds?.includes(id));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState<number>(700);
  const pdfViewerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      if (!pdfViewerRef.current) return;
      const available = pdfViewerRef.current.clientWidth - 32;
      setPageWidth(Math.max(420, Math.min(available, 900)));
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

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

  const toggleBookmark = async () => {
    if (!id || isBookmarking) return;
    setIsBookmarking(true);
    try {
      const res = await api.patch("/user/me/bookmarks", { materialId: id, add: !bookmarked });
      if (res.data?.data) {
        setAppUser(res.data.data);
      }
    } catch {
      /* ignore */
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleDownload = () => {
    if (!material?.fileUrl || isDownloading) return;
    setIsDownloading(true);
    setTimeout(() => {
      const a = document.createElement("a");
      a.href = blobUrl || material.fileUrl;
      a.download = material.title || "document.pdf";
      a.click();
      setTimeout(() => setIsDownloading(false), 800);
    }, 300);
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  if (isLoading) return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#030303]">
      <WorkspaceGridBackdrop />
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="p-4 rounded-2xl bg-[#5C55F9]/10 border border-[#5C55F9]/20 mb-4">
          <Loader2 className="w-8 h-8 text-[#5C55F9] animate-spin" />
        </div>
        <span className="text-gray-400 font-medium tracking-wide">Loading Document...</span>
      </div>
    </div>
  );

  return (
    <div className="relative p-4 md:p-6 h-screen w-full max-w-[1600px] mx-auto flex flex-col">
      <WorkspaceGridBackdrop />

      {/* Unified Split Container */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row w-full min-h-full bg-[#0c0c10]/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        
        {/* PDF Viewer Section */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {material?.fileUrl ? (
            <>
              {/* Header */}
              <div className="px-5 h-20 md:px-6 py-5 border-b border-white/5 bg-[#12121a]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-[#5C55F9]/20 border border-[#5C55F9]/30 text-[#5C55F9] shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h1 className="text-lg md:text-xl font-medium text-white truncate">
                      {material.title || material.fileName || "Untitled Document"}
                    </h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {material.status === 'processing' && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-[10px] uppercase font-bold tracking-wider mr-1">
                        Processing OCR
                      </span>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">

                      {(material.branch || material.semester) && (
                        <span>
                          <span className="text-gray-500">Branch: </span>{" "}
                          <span className="text-gray-300 font-medium">
                            {material.branch || "-"}
                            {material.semester ? ` • Sem ${material.semester}` : ""}
                          </span>
                        </span>
                      )}

                      {material.subject && (
                        <span>
                          <span className="text-gray-500">Subject: </span>{" "}
                          <span className="text-gray-300 font-medium">
                            {material.subject}
                          </span>
                        </span>
                      )}

                      {material.subjectCode && (
                        <span>
                          <span className="text-gray-500">Code: </span>{" "}
                          <span className="text-gray-300 font-medium">
                            {material.subjectCode}
                          </span>
                        </span>
                      )}

                      {material.year && (
                        <span>
                          <span className="text-gray-500">Year: </span>{" "}
                          <span className="text-gray-300 font-medium">
                            {material.year}
                          </span>
                        </span>
                      )}

                      {material.fileSize && (
                        <span>
                          <span className="text-gray-500">Size: </span>{" "}
                          <span className="text-gray-300 font-medium">
                            {(material.fileSize / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </span>
                      )}

                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isBookmarking}
                    onClick={() => void toggleBookmark()}
                    className={`h-10 px-4 rounded-xl transition-all ${bookmarked ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20" : "text-gray-300 hover:text-white bg-white/5 hover:bg-white/10"}`}
                  >
                    <Bookmark className={`w-4 h-4 mr-2 ${bookmarked ? "fill-current" : ""}`} />
                    {bookmarked ? "Saved" : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    disabled={isDownloading}
                    onClick={handleDownload}
                    className="bg-[#5C55F9] hover:bg-[#4b45d6] text-white h-10 px-5 rounded-xl shadow-[0_0_20px_rgba(92,85,249,0.25)] transition-all min-w-[130px]"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-4 h-4 mr-2.5 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2.5" />
                    )}
                    {isDownloading ? "Downloading..." : "Download"}
                  </Button>
                </div>
              </div>

              {/* Pagination / Toolbar */}
              <div className="flex items-center justify-between px-6 py-1.5 border-b border-white/5 bg-[#0a0a10]/40 shrink-0">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Document Preview</span>
                {numPages && (
                  <div className="flex items-center gap-1 bg-[#12121a] rounded-lg p-1 border border-white/10">
                    <button
                      disabled={pageNumber <= 1}
                      onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors rounded-md hover:bg-white/5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono text-gray-300 px-3 py-0.5">
                      {pageNumber} / {numPages}
                    </span>
                    <button
                      disabled={pageNumber >= numPages}
                      onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors rounded-md hover:bg-white/5"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* PDF Content */}
              <div
                ref={pdfViewerRef}
                className="flex-1 overflow-y-auto bg-black/40 p-2 md:p-2 flex flex-col items-center custom-scrollbar scroll-smooth"
                style={{ minHeight: 0 }}
              >
                {pdfLoading && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#5C55F9] animate-spin mb-4" />
                    <span className="text-gray-400 font-medium">Loading Viewer...</span>
                  </div>
                )}

                {!pdfLoading && blobUrl && (
                  <div className="max-w-full transition-all duration-500">
                    <Document
                      file={blobUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={() => setPdfError(true)}
                      loading={
                        <div className="flex flex-col items-center justify-center p-20">
                          <Loader2 className="w-6 h-6 text-[#5C55F9] animate-spin mb-3" />
                          <span className="text-gray-400 text-sm">Rendering PDF Format...</span>
                        </div>
                      }
                      className="flex flex-col items-center pb-12"
                    >
                      <div className="relative bg-[#1a1a24] rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.4)] overflow-hidden border border-white/5">
                        <Page
                          pageNumber={pageNumber}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          width={pageWidth}
                          className="shadow-inner"
                        />
                      </div>
                    </Document>
                  </div>
                )}

                {!pdfLoading && pdfError && (
                  <div className="flex flex-col items-center justify-center gap-4 text-gray-500 py-32">
                    <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                      <FileText className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="text-lg font-medium text-gray-300">Could not load PDF preview</p>
                    <p className="text-sm text-gray-500 max-w-sm text-center">The document may be corrupted, heavily protected, or strictly unavailable for web viewing.</p>
                    <Button
                      onClick={handleDownload}
                      className="bg-white text-black hover:bg-gray-200 mt-4 rounded-xl px-6"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF to View
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                  <FileText className="w-10 h-10 opacity-30" />
                </div>
                <p className="text-xl font-medium text-white mb-2">No file available</p>
                <p className="text-gray-400">This requested material doesn't have an associated file.</p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Chat Sidebar */}
        <div className="w-full lg:w-[420px] shrink-0 flex flex-col h-full border-t  lg:border-t-0 lg:border-l border-white/10 bg-black/20">
          <div className="p-5 h-20 border-b border-white/5 bg-linear-to-r from-[#5C55F9]/10 to-transparent flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#5C55F9]/20 flex items-center justify-center border border-[#5C55F9]/30">
                <Bot className="w-5 h-5 text-[#5C55F9]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">StudyShare AI</h3>
                <p className="text-[11px] text-gray-400 font-medium">Active Assistant</p>
              </div>
            </div>
            {material?.status === 'processing' ? (
              <div className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Processing
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest uppercase">
                Online
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar content-start" style={{ minHeight: 0 }}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center text-center text-gray-500 py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 opacity-40" />
                </div>
                <p className="text-base font-medium text-gray-300 mb-1">Start a conversation</p>
                <p className="text-xs max-w-[250px]">Ask me to summarize, explain concepts, or find specific information within this document.</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === "user" ? "bg-[#5C55F9] border-[#5C55F9]" : "bg-[#12121a] border-white/10"
                  }`}>
                  {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-gray-300" />}
                </div>
                <div className={`rounded-2xl px-5 py-4 max-w-[85%] ${msg.role === "user"
                    ? "bg-[#5C55F9] text-white rounded-tr-sm"
                    : "bg-[#12121a] border border-white/5 text-gray-200 rounded-tl-sm shadow-sm"
                  }`}>
                  {msg.role === "user" ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <div className="text-sm prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                          h1: ({ children }) => <h1 className="text-base font-bold mt-4 mb-2 text-[#a8a4fc]">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-2 text-[#a8a4fc]">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 text-[#a8a4fc]">{children}</h3>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1 text-gray-300">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1 text-gray-300">{children}</ol>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          code: ({ children, className }) => className
                            ? <pre className="bg-black/50 rounded-lg p-3 text-xs overflow-x-auto my-3 border border-white/5"><code>{children}</code></pre>
                            : <code className="bg-black/30 px-1.5 py-0.5 rounded text-[11px] text-[#a8a4fc] border border-white/5 mx-1">{children}</code>,
                          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                          blockquote: ({ children }) => <blockquote className="border-l-2 border-[#5C55F9] pl-4 py-1 italic text-gray-400 bg-white/5 rounded-r-lg my-3">{children}</blockquote>,
                          hr: () => <hr className="border-white/10 my-4" />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#12121a] border border-white/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-gray-400" />
                </div>
                <div className="bg-[#12121a] border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-2" />
          </div>

          <div className="p-4 border-t border-white/5 bg-[#0a0a10]/50 shrink-0 mt-auto">
            {material?.status === 'processing' ? (
              <div className="flex flex-col items-center gap-2 py-3 px-4 bg-amber-500/8 border border-amber-500/20 rounded-2xl text-center">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
                  <Clock className="w-4 h-4 animate-spin" />
                  Document is being processed
                </div>
                <p className="text-xs text-gray-500">
                  AI chat will be available once processing is complete.
                </p>
              </div>
            ) : (
            <div className="relative flex items-center">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ask anything..."
                className="h-12 pl-4 pr-14 text-sm bg-[#12121a] border-white/10 text-white placeholder:text-gray-500 focus:border-[#5C55F9]/50 focus:ring-1 focus:ring-[#5C55F9]/50 rounded-2xl shadow-inner"
                disabled={sending}
              />
              <Button
                size="sm"
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className="absolute right-1.5 h-9 w-9 p-0 rounded-xl bg-[#5C55F9] hover:bg-[#4b45d6] disabled:opacity-50 disabled:bg-gray-700 transition-colors"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white ml-0.5" />}
              </Button>
            </div>
            )}
            <p className="text-[10px] text-gray-500 font-medium mt-3 text-center tracking-wide uppercase">
              AI responses may be inaccurate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
