'use client';

import { useEffect, useMemo, useState } from 'react';
import { materialsApi, type Material } from '@/src/api/materials';
import { useRequireAuth } from '@/src/hooks/useRequireAuth';

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function iconFor(type: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('pdf')) return '📕';
  if (t.includes('image')) return '🖼️';
  if (t.includes('word') || t.includes('doc')) return '📝';
  if (t.includes('ppt')) return '📽️';
  if (t.includes('sheet') || t.includes('excel')) return '📊';
  if (t.includes('zip')) return '📦';
  return '📄';
}

export default function FilesPage() {
  const { ready } = useRequireAuth();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const canUpload = useMemo(() => !!file && !!title.trim() && !uploading, [file, title, uploading]);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await materialsApi.getAll();
      setMaterials(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const onPickFile = (f: File | null) => {
    setError('');
    setFile(f);
    if (f && !title.trim()) setTitle(f.name.replace(/\.[^/.]+$/, ''));
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      await materialsApi.create({ title: title.trim(), description: '', file });
      setFile(null);
      setTitle('');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!ready) return null;

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '88px 24px 48px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <p className="section-label">Upload</p>
          <h1 className="page-title">Materials</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px', fontSize: '0.95rem' }}>
            Minimal upload + list screen for backend testing.
          </p>
        </div>
        <button className="btn-ghost" onClick={load} disabled={loading || uploading}>
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

      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          <input
            className="input-field"
            placeholder="Title (required)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="input-field"
            type="file"
            onChange={(e) => onPickFile(e.target.files?.[0] || null)}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
          />

          <button className="btn-primary" onClick={upload} disabled={!canUpload}>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>

      <div style={{ height: '16px' }} />

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Uploaded materials
            <span style={{ marginLeft: '10px', fontSize: '0.75rem' }} className="badge badge-purple">
              {materials.length}
            </span>
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{loading ? 'Loading…' : ''}</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading materials…</p>
          </div>
        ) : materials.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No materials yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>File</th>
                  <th>Size</th>
                  <th>Downloads</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => (
                  <tr key={m.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{m.title}</td>
                    <td>
                      <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: 600 }}>
                        {iconFor(m.fileType)} {m.fileName || 'Open'}
                      </a>
                    </td>
                    <td>{formatBytes(m.fileSize)}</td>
                    <td>{m.downloads ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
