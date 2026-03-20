'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import Link from 'next/link';
import { Material } from '@/src/store/materialsStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function MaterialPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMaterial() {
      try {
        const res = await fetch(`${API_BASE}/materials/${id}`);
        if (!res.ok) throw new Error('Failed to fetch material');
        const data = await res.json();
        setMaterial(data.material);
        
        // Optionally record a download / view here
        await fetch(`${API_BASE}/materials/${id}/download`, { method: 'POST' });
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMaterial();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)' }}>
        Loading material...
      </div>
    );
  }

  if (error || !material) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#f87171' }}>Error loading file</h2>
        <p>{error || 'File not found'}</p>
        <Link href="/dashboard" className="btn-ghost" style={{ marginTop: '24px' }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '88px 24px 48px',
        minHeight: '100vh',
      }}
    >
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <button 
            onClick={() => router.back()} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer',
              marginBottom: '16px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ← Back
          </button>
          
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {material.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Uploaded on {new Date(material.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" download>
            ⬇ Download File ({(material.fileSize / 1024 / 1024).toFixed(2)} MB)
          </a>
        </div>
      </div>

      <div 
        style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: '16px', 
          overflow: 'hidden',
          height: '75vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
            Preview: {material.fileName}
          </p>
        </div>
        
        {/* PDF/File Viewer using embed constraint exactly as specified by user log */}
        <div style={{ flex: 1, backgroundColor: '#ececec' }}>
          <embed 
            src={material.fileUrl} 
            type={material.fileType}
            width="100%" 
            height="100%" 
            style={{ display: 'block', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
