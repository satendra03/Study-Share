'use client';

import { useAuth } from '@/src/hooks/useAuth';
import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useMaterialsStore } from '@/src/store/materialsStore';
import { storage, auth } from '@/src/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const selectMaterials = (state: any) => state.materials ?? [];
const selectFetchMaterials = (state: any) => state.fetchMaterials;
const selectAddMaterial = (state: any) => state.addMaterial;

export default function DashboardPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const materials = useMaterialsStore(selectMaterials);
  const fetchMaterials = useMaterialsStore(selectFetchMaterials);
  const addMaterial = useMaterialsStore(selectAddMaterial);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 15MB limit
    if (file.size > 15 * 1024 * 1024) {
      alert("File is too large! Maximum allowed is 15MB.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.split('.')[0]);
    formData.append('description', '');

    try {
      const fbUser = auth.currentUser;
      const idToken = fbUser ? await fbUser.getIdToken() : "";

      const res = await fetch(`${API_BASE}/materials`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${idToken}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        addMaterial(data.material);
        alert("File uploaded successfully!");
      } else {
        const err = await res.json();
        throw new Error(err.message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    {
      label: 'Files Uploaded',
      value: '5',
      icon: '📁',
      color: '#6366f1',
      bg: 'rgba(99,102,241,0.1)',
      border: 'rgba(99,102,241,0.2)',
      change: '+2 this week',
      changePositive: true,
    },
    {
      label: 'Chat Sessions',
      value: '3',
      icon: '✦',
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.1)',
      border: 'rgba(139,92,246,0.2)',
      change: '+1 today',
      changePositive: true,
    },
    {
      label: 'Total Messages',
      value: '24',
      icon: '💬',
      color: '#06b6d4',
      bg: 'rgba(6,182,212,0.1)',
      border: 'rgba(6,182,212,0.2)',
      change: '8 today',
      changePositive: true,
    },
    {
      label: 'Last Activity',
      value: '2h',
      icon: '⏰',
      color: '#10b981',
      bg: 'rgba(16,185,129,0.1)',
      border: 'rgba(16,185,129,0.2)',
      change: 'ago',
      changePositive: null,
    },
  ];

  const quickActions = [
    {
      href: '/files',
      icon: '📁',
      label: 'Upload Files',
      desc: 'Add new study materials',
      color: '#6366f1',
    },
    {
      href: '/chatbot',
      icon: '✦',
      label: 'Start AI Chat',
      desc: 'Get instant answers',
      color: '#8b5cf6',
    },
  ];



  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '88px 24px 48px',
        minHeight: '100vh',
      }}
    >
      {/* ── Welcome Header ── */}
      <div
        style={{
          marginBottom: '40px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
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
            Dashboard
          </p>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            {greeting()}, {user?.displayName?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Here's an overview of your study activity today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
          />
          <button 
            className="btn-ghost" 
            id="dashboard-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ opacity: uploading ? 0.7 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}
          >
            {uploading ? `Uploading...` : '📁 Upload File'}
          </button>
          <Link href="/chatbot" className="btn-primary" id="dashboard-chat-btn">
            ✦ New Chat
          </Link>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '36px',
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            className="stat-card"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {/* Icon */}
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: stat.bg,
                border: `1px solid ${stat.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginBottom: '16px',
              }}
            >
              {stat.icon}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {stat.label}
            </p>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '2.2rem',
                fontWeight: 700,
                color: stat.color,
                marginBottom: '8px',
                lineHeight: 1,
              }}
            >
              {stat.value}
              {stat.changePositive === null && (
                <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>
                  {stat.change}
                </span>
              )}
            </p>
            {stat.changePositive !== null && (
              <p
                style={{
                  fontSize: '0.8rem',
                  color: stat.changePositive ? '#34d399' : '#f87171',
                  fontWeight: 500,
                }}
              >
                {stat.changePositive ? '↑' : '↓'} {stat.change}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Recent Activity */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Recent Activity
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View All
            </span>
          </div>

          <div style={{ padding: '16px 0' }}>
            {materials.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.5 }}>📭</div>
                No recent uploads yet.
              </div>
            ) : (
              materials.slice(0, 5).map((material, i) => (
                <Link
                  key={material._id}
                  href={`/materials/${material._id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '14px 24px',
                    textDecoration: 'none',
                    transition: 'background 0.2s ease',
                    borderBottom: i < Math.min(materials.length, 5) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.03)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: `rgba(99,102,241, 0.15)`,
                      border: `1px solid rgba(99,102,241, 0.25)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      flexShrink: 0,
                    }}
                  >
                    📄
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{material.fileName}</span>
                    </p>
                  </div>
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0 }}>
                    {new Date(material.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '20px',
              }}
            >
              Quick Actions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {quickActions.map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="glass-card"
                  id={`quick-action-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px',
                    textDecoration: 'none',
                    borderRadius: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: `${action.color}18`,
                      border: `1px solid ${action.color}28`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}
                  >
                    {action.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {action.label}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{action.desc}</p>
                  </div>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '1rem' }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* User Profile Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.12) 100%)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || "User"} 
                referrerPolicy="no-referrer"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  margin: '0 auto 14px',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.4)'
                }}
              />
            ) : (
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'white',
                  margin: '0 auto 14px',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                }}
              >
                {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {user?.displayName}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {user?.email}
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: '999px',
                padding: '5px 14px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#a5b4fc',
              }}
            >
              ✓ Active Member
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
