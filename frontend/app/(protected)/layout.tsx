'use client';

import React from 'react';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { useAuth } from '@/src/hooks/useAuth';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  // Don't render anything while auth is loading to prevent flash
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

  return <ProtectedRoute>{children}</ProtectedRoute>;
}
