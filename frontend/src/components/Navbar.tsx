'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/src/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, pendingFirebaseUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navLinks = isAuthenticated && !pendingFirebaseUser
    ? [
      { href: '/files', label: 'Upload', icon: '📁' },
      { href: '/chatbot', label: 'Chat', icon: '✦' },
    ]
    : [];

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: '64px',
        transition: 'all 0.3s ease',
        background: scrolled
          ? 'rgba(10, 11, 20, 0.9)'
          : 'rgba(10, 11, 20, 0.5)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: scrolled
          ? '1px solid rgba(255, 255, 255, 0.08)'
          : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
            }}
          >
            📚
          </div>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Study Share
          </span>
        </Link>

        {/* Center Nav Links */}
        {navLinks.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '4px',
            }}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 16px',
                    borderRadius: '9px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))'
                      : 'transparent',
                    color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.6)',
                    border: isActive
                      ? '1px solid rgba(99,102,241,0.3)'
                      : '1px solid transparent',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '6px 12px',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'white',
                  }}
                >
                  {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                  }}
                >
                  {user?.displayName || 'User'}
                </span>
              </div>
              <button
                id="logout-btn"
                onClick={handleLogout}
                className="btn-danger"
                style={{ padding: '7px 16px', fontSize: '0.855rem' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth" className="btn-primary" id="nav-login-btn">
              Get Started →
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
