'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
    const { loginWithGoogle, isAuthenticated, isLoading, pendingFirebaseUser, backendAuthError, retryBackendAuth } = useAuth();
    const router = useRouter();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already authed or new user needing profile completion
    useEffect(() => {
        if (isLoading) return;
        if (isAuthenticated) router.push('/files');
        else if (pendingFirebaseUser) router.push('/complete-profile');
    }, [isAuthenticated, isLoading, pendingFirebaseUser, router]);

    const handleGoogleSignIn = async () => {
        setError('');
        setIsSigningIn(true);
        try {
            await loginWithGoogle();
        } catch (err: any) {
            if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
            } else {
                setError(err?.message || 'Sign-in failed. Please try again.');
            }
        } finally {
            setIsSigningIn(false);
        }
    };

    const isButtonLoading = isLoading || isSigningIn || isAuthenticated || pendingFirebaseUser;

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 24px 24px',
                background:
                    'radial-gradient(ellipse at 40% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.1) 0%, transparent 55%)',
            }}
        >
            <div style={{ width: '100%', maxWidth: '420px' }}>

                {/* Logo + Brand */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <Link href="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                        <div
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '26px',
                                boxShadow: '0 4px 24px rgba(99,102,241,0.45)',
                            }}
                        >
                            📚
                        </div>
                        <span
                            style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontWeight: 700,
                                fontSize: '1.3rem',
                                color: 'var(--text-primary)',
                            }}
                        >
                            Study Share
                        </span>
                    </Link>

                    <h1
                        style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: '1.9rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            marginTop: '28px',
                            marginBottom: '8px',
                        }}
                    >
                        Login / Sign up
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.55 }}>
                        Use Google to quickly test the backend (auth token is sent automatically).
                    </p>
                </div>

                {/* Card */}
                <div
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '20px',
                        padding: '36px 32px',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                    }}
                >
                    {/* Error */}
                    {error && (
                        <div className="alert-error" style={{ marginBottom: '20px' }}>
                            <span>⚠</span>
                            {error}
                        </div>
                    )}

                    {/* Backend auth error (network/CORS/wrong URL) */}
                    {backendAuthError && (
                        <div className="alert-error" style={{ marginBottom: '20px' }}>
                            <span>⚠</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                                <div style={{ lineHeight: 1.5 }}>{backendAuthError}</div>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() => retryBackendAuth()}
                                        disabled={isLoading || isSigningIn}
                                        style={{ padding: '10px 16px' }}
                                    >
                                        Retry backend sign-in
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-ghost"
                                        onClick={() => window.location.reload()}
                                        style={{ padding: '10px 16px' }}
                                    >
                                        Reload
                                    </button>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'rgba(252,165,165,0.75)' }}>
                                    Tip: set <strong>NEXT_PUBLIC_API_URL</strong> in <strong>.env.local</strong> (example: <code>http://localhost:5000/api</code>) and restart <code>npm run dev</code>.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Google Sign-In Button */}
                    <button
                        id="google-signin-btn"
                        onClick={handleGoogleSignIn}
                        disabled={!!isButtonLoading}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            background: isButtonLoading ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)',
                            border: '1px solid rgba(255,255,255,0.14)',
                            borderRadius: '12px',
                            color: 'var(--text-primary)',
                            cursor: isButtonLoading ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            padding: '14px 20px',
                            transition: 'all 0.25s ease',
                            opacity: isButtonLoading ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => {
                            if (!isButtonLoading) {
                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.22)';
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.14)';
                            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                        }}
                    >
                        {isButtonLoading ? (
                            <>
                                <span
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        border: '2px solid rgba(255,255,255,0.2)',
                                        borderTop: '2px solid white',
                                        borderRadius: '50%',
                                        animation: 'spin 0.7s linear infinite',
                                        display: 'inline-block',
                                        flexShrink: 0,
                                    }}
                                />
                                {isAuthenticated || pendingFirebaseUser ? 'Redirecting...' : 'Signing in...'}
                            </>
                        ) : (
                            <>
                                {/* Google G logo SVG */}
                                <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                                    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </button>

                    {/* Divider with info */}
                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            By signing in you agree to our{' '}
                            <span style={{ color: 'var(--accent-primary)', cursor: 'pointer' }}>Terms of Service</span>
                            {' '}and{' '}
                            <span style={{ color: 'var(--accent-primary)', cursor: 'pointer' }}>Privacy Policy</span>.
                        </p>
                    </div>
                </div>

                {/* Feature highlights */}
                <div
                    style={{
                        marginTop: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }}
                >
                    {[
                        { icon: '📁', text: 'Upload & manage your study files' },
                        { icon: '✦', text: 'Chat with an AI study assistant' },
                        { icon: '📊', text: 'Track your learning progress' },
                    ].map((item, i) => (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                color: 'var(--text-muted)',
                                fontSize: '0.875rem',
                            }}
                        >
                            <span
                                style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '8px',
                                    background: 'rgba(99,102,241,0.1)',
                                    border: '1px solid rgba(99,102,241,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    flexShrink: 0,
                                }}
                            >
                                {item.icon}
                            </span>
                            {item.text}
                        </div>
                    ))}
                </div>

                {/* Back link */}
                <div style={{ textAlign: 'center', marginTop: '28px' }}>
                    <Link
                        href="/"
                        style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.85rem',
                            textDecoration: 'none',
                            transition: 'color 0.2s ease',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; }}
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
