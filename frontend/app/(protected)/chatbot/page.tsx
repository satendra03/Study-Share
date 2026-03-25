'use client';

import { useState, useEffect, useRef } from 'react';
import { chatbotApi, ChatSession, ChatMessage } from '@/src/api/chatbot';
import { trackEvent, AnalyticsEvents } from '@/src/lib/analytics';

export default function ChatbotPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await chatbotApi.getSessions();
      setSessions(data.sessions);
      if (data.sessions.length > 0) {
        setActiveSession(data.sessions[0]);
        loadMessages(data.sessions[0]._id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const data = await chatbotApi.getMessages(sessionId);
      setMessages(data.messages);
    } catch (err: any) {
      console.error('Failed to load messages', err);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle.trim()) return;

    try {
      const data = await chatbotApi.createSession({ title: newSessionTitle });
      setSessions([...sessions, data.session]);
      setActiveSession(data.session);
      setMessages([]);
      setNewSessionTitle('');
      trackEvent(AnalyticsEvents.CHAT_SESSION_CREATE);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create session');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeSession || isSending) return;

    const content = messageInput.trim();
    setMessageInput('');
    setIsSending(true);

    // Add user message immediately
    const userMessage: ChatMessage = {
      _id: Date.now().toString(),
      sessionId: activeSession._id,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const data = await chatbotApi.sendMessage(activeSession._id, { content });
      setMessages(prev => [...prev, data.message]);
      trackEvent(AnalyticsEvents.CHAT_MESSAGE_SEND);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleSessionSelect = (session: ChatSession) => {
    setActiveSession(session);
    loadMessages(session._id);
  };

  if (isLoading) {
    return <div className="p-6">Loading chatbot...</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 border-r">
        <h2 className="text-lg font-semibold mb-4">Chat Sessions</h2>
        
        <form onSubmit={handleCreateSession} className="mb-4">
          <input
            type="text"
            value={newSessionTitle}
            onChange={(e) => setNewSessionTitle(e.target.value)}
            placeholder="New session title"
            className="w-full p-2 border rounded mb-2"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Create Session
          </button>
        </form>

        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session._id}
              onClick={() => handleSessionSelect(session)}
              className={`p-2 rounded cursor-pointer ${
                activeSession?._id === session._id ? 'bg-blue-200' : 'hover:bg-gray-200'
              }`}
            >
              <div className="font-medium">{session.title}</div>
              <div className="text-sm text-gray-500">
                {new Date(session.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeSession ? (
          <>
            <div className="p-4 border-b bg-white">
              <h1 className="text-xl font-semibold">{activeSession.title}</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={isSending || !messageInput.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Welcome to StudyShare Chatbot</h2>
              <p className="text-gray-600">Create a new session to start chatting about your study materials.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
      setError(err.response?.data?.message || 'Failed to create session');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeSession || isSending) return;

    setIsSending(true);
    try {
      await chatbotApi.sendMessage(activeSession.id, messageInput);
      setMessageInput('');
      trackEvent(AnalyticsEvents.CHAT_MESSAGE_SEND, {
        session_id: activeSession.id,
        message_length: messageInput.length,
      });

      if (activeSession) {
        const updatedSession = await chatbotApi.getSession(activeSession.id);
        setActiveSession(updatedSession);
        setSessions(sessions.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await chatbotApi.deleteSession(sessionId);
      const newSessions = sessions.filter((s) => s.id !== sessionId);
      setSessions(newSessions);
      if (activeSession?.id === sessionId) {
        setActiveSession(newSessions[0] || null);
      }
      trackEvent(AnalyticsEvents.CHAT_SESSION_DELETE);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete session');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '88px 24px 24px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--accent-primary)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          AI Assistant
        </p>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          AI Chatbot
        </h1>
      </div>

      {/* Error */}
      {error && (
        <div className="alert-error" style={{ marginBottom: '20px' }}>
          <span>⚠</span>
          {error}
          <button
            onClick={() => setError('')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', fontSize: '18px' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Chat Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '20px',
          flex: 1,
          minHeight: 0,
          height: 'calc(100vh - 220px)',
        }}
      >
        {/* ── Sidebar ── */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Sidebar Header */}
          <div
            style={{
              padding: '20px 16px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '14px',
              }}
            >
              Conversations
            </h2>

            {/* New Session Form */}
            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
                placeholder="New conversation title..."
                className="input-field"
                style={{ fontSize: '0.85rem', padding: '9px 12px' }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '9px', fontSize: '0.85rem', width: '100%' }}
              >
                + New Chat
              </button>
            </form>
          </div>

          {/* Sessions List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {isLoading ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 10px', width: '28px', height: '28px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Loading...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.4 }}>💬</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No conversations yet</p>
              </div>
            ) : (
              sessions.map((session) => {
                const isActive = activeSession?.id === session.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => setActiveSession(session)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      marginBottom: '4px',
                      transition: 'all 0.2s ease',
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))'
                        : 'transparent',
                      border: isActive
                        ? '1px solid rgba(99,102,241,0.3)'
                        : '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: isActive ? '#a5b4fc' : 'var(--text-primary)',
                            marginBottom: '3px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {session.title}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          fontSize: '14px',
                          padding: '2px',
                          opacity: 0.6,
                          transition: 'opacity 0.2s, color 0.2s',
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                          (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.opacity = '0.6';
                          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                        }}
                        title="Delete session"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {!activeSession ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                  border: '1px solid rgba(99,102,241,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  marginBottom: '20px',
                  animation: 'float 4s ease-in-out infinite',
                }}
              >
                ✦
              </div>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                }}
              >
                Start a Conversation
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '300px', lineHeight: 1.6 }}>
                Create a new chat session or select an existing one from the sidebar to begin.
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))',
                    border: '1px solid rgba(99,102,241,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                  }}
                >
                  ✦
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {activeSession.title}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {activeSession.messages.length} message{activeSession.messages.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Messages Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {activeSession.messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      ✨ Start chatting with the AI!
                    </p>
                  </div>
                ) : (
                  activeSession.messages.map((message: Message) => (
                    <div
                      key={message.id}
                      style={{
                        display: 'flex',
                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                        gap: '10px',
                        alignItems: 'flex-end',
                      }}
                    >
                      {message.sender !== 'user' && (
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))',
                            border: '1px solid rgba(99,102,241,0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            flexShrink: 0,
                          }}
                        >
                          ✦
                        </div>
                      )}
                      <div
                        style={{
                          maxWidth: '65%',
                          padding: '12px 16px',
                          borderRadius: message.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background:
                            message.sender === 'user'
                              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                              : 'rgba(255,255,255,0.06)',
                          border:
                            message.sender === 'user'
                              ? 'none'
                              : '1px solid rgba(255,255,255,0.08)',
                          boxShadow:
                            message.sender === 'user'
                              ? '0 4px 14px rgba(99,102,241,0.3)'
                              : 'none',
                        }}
                      >
                        <p
                          style={{
                            fontSize: '0.9rem',
                            color: message.sender === 'user' ? 'white' : 'var(--text-primary)',
                            lineHeight: 1.55,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {message.content}
                        </p>
                        <p
                          style={{
                            fontSize: '0.72rem',
                            marginTop: '6px',
                            color: message.sender === 'user' ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)',
                          }}
                        >
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {message.sender === 'user' && (
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: 'white',
                            flexShrink: 0,
                          }}
                        >
                          U
                        </div>
                      )}
                    </div>
                  ))
                )}

                {/* Typing indicator */}
                {isSending && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                      }}
                    >
                      ✦
                    </div>
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: '16px 16px 16px 4px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--accent-primary)',
                            display: 'inline-block',
                            animation: `pulse-glow 1.2s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '16px 20px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                }}
              >
                <input
                  id="chat-message-input"
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSending}
                  placeholder="Ask anything... (Press Enter to send)"
                  className="input-field"
                  style={{
                    flex: 1,
                    fontSize: '0.9rem',
                    background: isSending ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                  }}
                />
                <button
                  id="chat-send-btn"
                  type="submit"
                  disabled={isSending || !messageInput.trim()}
                  className="btn-primary"
                  style={{
                    padding: '12px 20px',
                    fontSize: '0.9rem',
                    flexShrink: 0,
                  }}
                >
                  {isSending ? '...' : '↑ Send'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
