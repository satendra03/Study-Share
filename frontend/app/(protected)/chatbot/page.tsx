"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { MessageSquare, Plus, Trash2, Send, Bot, Loader2, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceGridBackdrop } from "@/components/WorkspaceGridBackdrop";

interface ChatSession {
  _id: string;
  title: string;
  createdAt: string;
}

interface ChatMessage {
  _id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export default function ChatbotPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  // On mobile: "sessions" view or "chat" view
  const [mobileView, setMobileView] = useState<"sessions" | "chat">("sessions");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await api.get("/chatbot/sessions");
      const list: ChatSession[] = res.data?.data ?? res.data?.sessions ?? [];
      setSessions(list);
      if (list.length > 0) {
        openSession(list[0]);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingSessions(false);
    }
  };

  const openSession = async (session: ChatSession) => {
    setActiveSession(session);
    setMessages([]);
    setMobileView("chat");
    setLoadingMessages(true);
    try {
      const res = await api.get(`/chatbot/sessions/${session._id}/messages`);
      setMessages(res.data?.data ?? res.data?.messages ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoadingMessages(false);
    }
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || creating) return;
    setCreating(true);
    try {
      const res = await api.post("/chatbot/sessions", { title: newTitle.trim() });
      const session: ChatSession = res.data?.data ?? res.data?.session;
      setSessions((prev) => [session, ...prev]);
      setNewTitle("");
      openSession(session);
    } catch {
      /* ignore */
    } finally {
      setCreating(false);
    }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/chatbot/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      if (activeSession?._id === id) {
        setActiveSession(null);
        setMessages([]);
        setMobileView("sessions");
      }
    } catch {
      /* ignore */
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeSession || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    const optimistic: ChatMessage = {
      _id: Date.now().toString(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const res = await api.post(`/chatbot/sessions/${activeSession._id}/messages`, { content });
      const reply: ChatMessage = res.data?.data ?? res.data?.message;
      if (reply) setMessages((prev) => [...prev, reply]);
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  };

  const SessionsList = (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="px-4 pt-5 pb-4 border-b border-white/6 shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-[#b4afff]" />
          <h2 className="text-sm font-semibold text-white">Conversations</h2>
        </div>
        <form onSubmit={createSession} className="flex flex-col gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New conversation..."
            className="h-9 bg-[#12121a] border-white/10 text-white placeholder:text-gray-600 text-sm focus:border-[#5C55F9]/50 focus:ring-[#5C55F9]/30 rounded-xl"
          />
          <Button
            type="submit"
            disabled={creating || !newTitle.trim()}
            className="h-9 bg-[#5C55F9] hover:bg-[#4b45d6] text-white text-sm rounded-xl gap-2 disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            New Chat
          </Button>
        </form>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto p-2">
        {loadingSessions ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-[#5C55F9] animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-10 text-gray-600 text-xs">
            No conversations yet
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = activeSession?._id === session._id;
            return (
              <button
                key={session._id}
                onClick={() => openSession(session)}
                className={`w-full text-left flex items-start justify-between gap-2 px-3 py-2.5 rounded-xl mb-0.5 group transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#5C55F9]/10 border border-[#5C55F9]/25 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/4 border border-transparent"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    {new Date(session.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteSession(session._id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition-all rounded-lg hover:bg-red-950/20 shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  const ChatArea = (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="px-5 py-4 border-b border-white/6 flex items-center gap-3 bg-[#0a0a10]/60 shrink-0">
        {/* Back button on mobile */}
        <button
          onClick={() => setMobileView("sessions")}
          className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-xl bg-[#5C55F9]/15 border border-[#5C55F9]/25 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-[#b4afff]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {activeSession?.title ?? "StudyShare AI"}
          </p>
          <p className="text-[10px] text-gray-500">AI Assistant</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Online
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5" style={{ minHeight: 0 }}>
        {!activeSession ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-[#5C55F9]/10 border border-[#5C55F9]/20 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-[#5C55F9]/60" />
            </div>
            <p className="text-gray-300 font-medium mb-1">Start a Conversation</p>
            <p className="text-xs text-gray-600 max-w-xs">
              Create a new chat or select one from the sidebar.
            </p>
          </div>
        ) : loadingMessages ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 text-[#5C55F9] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <p className="text-xs text-gray-600">Send a message to get started</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center border text-xs font-semibold ${
                msg.role === "user"
                  ? "bg-[#5C55F9] border-[#5C55F9] text-white"
                  : "bg-[#12121a] border-white/10 text-gray-300"
              }`}>
                {msg.role === "user" ? "U" : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#5C55F9] text-white rounded-tr-sm"
                  : "bg-[#12121a] border border-white/6 text-gray-200 rounded-tl-sm"
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}

        {sending && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[#12121a] border border-white/10 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="bg-[#12121a] border border-white/6 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {activeSession && (
        <div className="p-4 border-t border-white/6 bg-[#0a0a10]/50 shrink-0">
          <div className="relative flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask anything..."
              disabled={sending}
              className="h-12 pl-4 pr-14 bg-[#12121a] border-white/10 text-white placeholder:text-gray-600 text-sm focus:border-[#5C55F9]/50 focus:ring-[#5C55F9]/30 rounded-2xl"
            />
            <Button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="absolute right-1.5 h-9 w-9 p-0 rounded-xl bg-[#5C55F9] hover:bg-[#4b45d6] disabled:opacity-40 disabled:bg-gray-700"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Send className="w-4 h-4 text-white ml-0.5" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-gray-600 text-center mt-2 tracking-wide uppercase">
            AI responses may be inaccurate
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] md:h-screen bg-[#030303] text-white overflow-hidden">
      <WorkspaceGridBackdrop className="max-h-48 min-h-0" />

      {/* Page header */}
      <div className="relative z-10 px-5 md:px-8 pt-6 pb-4 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C55F9]/80 mb-1">AI Assistant</p>
        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">Chatbot</h1>
      </div>

      {/* Main layout */}
      <div className="relative z-10 flex flex-1 min-h-0 mx-4 md:mx-8 mb-4 gap-4 overflow-hidden">
        {/* Desktop sidebar / Mobile sessions view */}
        <div className={`
          w-full md:w-72 shrink-0 rounded-2xl border border-white/8 bg-[#0c0c12]/80 backdrop-blur-sm overflow-hidden
          ${mobileView === "chat" ? "hidden md:flex md:flex-col" : "flex flex-col"}
        `}>
          {SessionsList}
        </div>

        {/* Desktop chat / Mobile chat view */}
        <div className={`
          flex-1 rounded-2xl border border-white/8 bg-[#0c0c12]/80 backdrop-blur-sm overflow-hidden
          ${mobileView === "sessions" ? "hidden md:flex md:flex-col" : "flex flex-col"}
        `}>
          {ChatArea}
        </div>
      </div>
    </div>
  );
}
