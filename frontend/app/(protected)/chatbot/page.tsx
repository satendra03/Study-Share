'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { chatbotApi, type ChatMessage, type ChatSession } from '@/src/api/chatbot';
import { useRequireAuth } from '@/src/hooks/useRequireAuth';

export default function ChatbotPage() {
  const { ready } = useRequireAuth();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newTitle, setNewTitle] = useState('Test chat');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);

  const activeSession = useMemo(
    () => sessions.find((s) => s._id === activeSessionId) || null,
    [sessions, activeSessionId]
  );

  const loadSessions = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await chatbotApi.getSessions();
      setSessions(res.sessions);
      const first = res.sessions[0]?._id || null;
      setActiveSessionId((prev) => prev || first);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const res = await chatbotApi.getMessages(sessionId);
      setMessages(res.messages);
    } catch (e) {
      // keep silent; user can retry by switching sessions
      setMessages([]);
    }
  };

  useEffect(() => {
    if (!ready) return;
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    if (!activeSessionId) return;
    loadMessages(activeSessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, activeSessionId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const createSession = async () => {
    const title = newTitle.trim();
    if (!title) return;
    setError('');
    try {
      const res = await chatbotApi.createSession({ title });
      setSessions((prev) => [res.session, ...prev]);
      setActiveSessionId(res.session._id);
      setNewTitle('Test chat');
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to create session');
    }
  };

  const deleteSession = async (sessionId: string) => {
    setError('');
    try {
      await chatbotApi.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      setMessages((prev) => (activeSessionId === sessionId ? [] : prev));
      setActiveSessionId((prev) => (prev === sessionId ? null : prev));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to delete session');
    }
  };

  const send = async () => {
    const content = input.trim();
    if (!content || !activeSessionId || sending) return;

    setSending(true);
    setError('');
    setInput('');

    const optimistic: ChatMessage = {
      _id: `tmp-${Date.now()}`,
      sessionId: activeSessionId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await chatbotApi.sendMessage(activeSessionId, { content });
      setMessages((prev) => [...prev, res.message]);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!ready) return null;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '88px 24px 48px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <p className="section-label">Chat</p>
          <h1 className="page-title">Backend test chatbot</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px', fontSize: '0.95rem' }}>
            Sessions + messages using `/chatbot/*` endpoints.
          </p>
        </div>
        <button className="btn-ghost" onClick={loadSessions} disabled={loading || sending}>
          ↻ Refresh
        </button>
      </div>

      <div className="divider" />

      {error && (
        <div className="alert-error" style={{ marginBottom: '16px' }}>
          <span>⚠</span>
          {error}
          <button
            onClick={() => setError('')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', fontSize: '18px' }}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px' }}>
        {/* Sidebar */}
        <div className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '520px' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="input-field" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New session title" />
              <button className="btn-primary" onClick={createSession} style={{ padding: '10px 14px' }}>
                +
              </button>
            </div>
          </div>

          <div style={{ padding: '10px', overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 10px', width: '28px', height: '28px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading…</p>
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No sessions yet.
              </div>
            ) : (
              sessions.map((s) => {
                const active = s._id === activeSessionId;
                return (
                  <div
                    key={s._id}
                    onClick={() => setActiveSessionId(s._id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                      border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: active ? '#a5b4fc' : 'var(--text-primary)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.title}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {new Date(s.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      className="btn-danger"
                      style={{ padding: '6px 10px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(s._id);
                      }}
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '520px' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              {activeSession ? activeSession.title : 'No session selected'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {activeSessionId ? `Session: ${activeSessionId}` : ''}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {!activeSessionId ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                Create or select a session to start chatting.
              </div>
            ) : messages.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                No messages yet.
              </div>
            ) : (
              messages.map((m) => {
                const mine = m.role === 'user';
                return (
                  <div key={m._id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '10px 12px',
                        borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: mine ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
                        border: mine ? 'none' : '1px solid rgba(255,255,255,0.08)',
                        color: mine ? 'white' : 'var(--text-primary)',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.5,
                        fontSize: '0.95rem',
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}
            {sending && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '10px 12px', borderRadius: '14px 14px 14px 4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                  …
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div style={{ padding: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '10px' }}>
            <input
              className="input-field"
              placeholder={activeSessionId ? 'Type message…' : 'Create/select session first…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={!activeSessionId || sending}
            />
            <button className="btn-primary" onClick={send} disabled={!activeSessionId || sending || !input.trim()} style={{ padding: '10px 16px' }}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
