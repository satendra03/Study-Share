'use client';

import Link from 'next/link';
import { useAuth } from '@/src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/files');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '88px 24px 48px',
          textAlign: 'center',
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.16) 0%, transparent 65%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.10) 0%, transparent 55%)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '720px' }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.1 }}>
            Study Share <span className="gradient-text">Test Frontend</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '14px', fontSize: '1.05rem', lineHeight: 1.65 }}>
            Minimal UI to test backend endpoints: <strong>auth</strong>, <strong>materials upload</strong>, and <strong>chat</strong>.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '28px' }}>
            <Link href="/auth" className="btn-primary">
              Login / Sign up →
            </Link>
            <Link href="/files" className="btn-ghost">
              Go to Upload
            </Link>
            <Link href="/chatbot" className="btn-ghost">
              Go to Chat
            </Link>
          </div>

          <div style={{ marginTop: '28px' }} className="glass-card">
            <div style={{ padding: '18px 18px', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>What’s included</div>
              <div>1) Google login/signup (Firebase token → backend)</div>
              <div>2) Upload material + list materials</div>
              <div>3) Chat sessions + messages</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
