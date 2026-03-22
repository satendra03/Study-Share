"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { ChatMessage } from "@/types";
import { Send, Bot, User, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm your AI study assistant. Ask me anything about your subjects, concepts, or study tips!" }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
      const res = await api.post("/chatbot/chat", { message: userMsg, history: messages });
      const reply = res.data.data?.reply || "No response";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Chatbot</h1>
          <p className="text-gray-400 text-sm">Your general-purpose study assistant</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setMessages([{ role: "assistant", content: "Hi! How can I help you study today?" }])}
          className="text-gray-500 hover:text-red-400">
          <Trash2 className="w-4 h-4 mr-1" /> Clear
        </Button>
      </div>

      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "user" ? "bg-indigo-600" : "bg-gray-700"
              }`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`rounded-2xl px-4 py-2.5 text-sm max-w-[80%] ${
                msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-200"
              }`}>
                {msg.role === "user" ? msg.content : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      code: ({ children, className }) => className
                        ? <pre className="bg-gray-900 rounded-lg p-3 text-xs overflow-x-auto my-2 text-green-300"><code>{children}</code></pre>
                        : <code className="bg-gray-900 px-1.5 py-0.5 rounded text-indigo-300 text-xs">{children}</code>,
                      strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                      hr: () => <hr className="border-gray-600 my-3" />,
                      blockquote: ({ children }) => <blockquote className="border-l-2 border-indigo-500 pl-3 italic text-gray-400 my-2">{children}</blockquote>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-800 rounded-2xl px-4 py-3">
                <div className="flex gap-1.5">
                  {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
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
            placeholder="Ask anything about your studies..."
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
          <Button onClick={sendMessage} disabled={sending || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700 px-3">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
