'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { auth } from '@/src/lib/firebase';
import { trackEvent } from '@/src/lib/analytics';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type Role = 'student' | 'teacher';

export default function CompleteProfilePage() {
    const { pendingFirebaseUser, onProfileComplete, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const [role, setRole] = useState<Role | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Student fields
    const [fullName, setFullName] = useState('');
    const [semester, setSemester] = useState('');
    const [branch, setBranch] = useState('');
    const [collegeId, setCollegeId] = useState('');
    const [enrollmentNumber, setEnrollmentNumber] = useState('');

    // Teacher fields
    const [teacherName, setTeacherName] = useState('');
    const [teacherId, setTeacherId] = useState('');

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.push('/dashboard');
            } else if (!pendingFirebaseUser) {
                router.push('/auth');
            }
        }
    }, [isLoading, isAuthenticated, pendingFirebaseUser, router]);

    // Pre-fill name from Google if available
    useEffect(() => {
        const nameFallback = auth.currentUser?.displayName || pendingFirebaseUser?.name || '';
        if (nameFallback) {
            setFullName(nameFallback);
            setTeacherName(nameFallback);
        }
    }, [pendingFirebaseUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const fbUser = auth.currentUser;
            if (!fbUser) throw new Error('Not signed in to Firebase');
            const idToken = await fbUser.getIdToken(true);

            let res: Response;

            if (role === 'student') {
                res = await fetch(`${API_BASE}/auth/register/student`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken, fullName, semester: Number(semester), branch, collegeId, enrollmentNumber }),
                });
            } else {
                res = await fetch(`${API_BASE}/auth/register/teacher`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken, fullName: teacherName, teacherId }),
                });
            }

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Registration failed');
            }

            const response = await res.json();
            const user = response.data;
            trackEvent('profile_complete', { role });
            onProfileComplete(user);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || (!pendingFirebaseUser && !isAuthenticated)) return null;

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 24px 40px',
                background:
                    'radial-gradient(ellipse at 40% 50%, rgba(99,102,241,0.15) 0%, transparent 60%)',
            }}
        >
            <div style={{ width: '100%', maxWidth: '520px' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div
                        style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            margin: '0 auto 16px',
                            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                        }}
                    >
                        👋
                    </div>
                    <h1
                        style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: '1.9rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            marginBottom: '8px',
                        }}
                    >
                        Complete Your Profile
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Signed in as <strong style={{ color: 'var(--text-primary)' }}>{pendingFirebaseUser?.email}</strong>
                    </p>
                </div>

                {/* Role selector */}
                {!role && (
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '20px',
                            padding: '32px',
                            backdropFilter: 'blur(24px)',
                        }}
                    >
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px', fontSize: '0.95rem' }}>
                            Who are you joining as?
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {([
                                { value: 'student' as Role, icon: '🎓', title: 'Student', desc: 'Access files & AI chat' },
                                { value: 'teacher' as Role, icon: '👩‍🏫', title: 'Teacher', desc: 'Pending admin verification' },
                            ]).map((opt) => (
                                <button
                                    key={opt.value}
                                    id={`role-${opt.value}`}
                                    onClick={() => setRole(opt.value)}
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '14px',
                                        padding: '24px 16px',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s ease',
                                        color: 'var(--text-primary)',
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.1)';
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.4)';
                                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>{opt.icon}</div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '6px' }}>{opt.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Form */}
                {role && (
                    <form onSubmit={handleSubmit}>
                        <div
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '20px',
                                padding: '32px',
                                backdropFilter: 'blur(24px)',
                            }}
                        >
                            {/* Role badge + back */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <span
                                    style={{
                                        background: 'rgba(99,102,241,0.12)',
                                        border: '1px solid rgba(99,102,241,0.25)',
                                        borderRadius: '999px',
                                        padding: '4px 14px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: '#a5b4fc',
                                    }}
                                >
                                    {role === 'student' ? '🎓 Student' : '👩‍🏫 Teacher'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setRole(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        fontSize: '0.82rem',
                                    }}
                                >
                                    ← Change role
                                </button>
                            </div>

                            {error && (
                                <div className="alert-error" style={{ marginBottom: '20px' }}>
                                    <span>⚠</span> {error}
                                </div>
                            )}

                            {role === 'teacher' && (
                                <div
                                    style={{
                                        background: 'rgba(245,158,11,0.08)',
                                        border: '1px solid rgba(245,158,11,0.2)',
                                        borderRadius: '10px',
                                        padding: '12px 16px',
                                        marginBottom: '20px',
                                        fontSize: '0.83rem',
                                        color: '#fcd34d',
                                    }}
                                >
                                    ⏳ Teacher accounts require admin verification before you can upload files. You can browse content in the meantime.
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {role === 'student' ? (
                                    <>
                                        <Field label="Full Name (from Google)" id="fullName" value={fullName} onChange={() => {}} placeholder="" required readonly />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <Field label="Semester" id="semester" type="number" value={semester} onChange={setSemester} placeholder="e.g. 4" min={1} max={12} required />
                                            <Field label="Branch" id="branch" value={branch} onChange={setBranch} placeholder="e.g. CSE" required />
                                        </div>
                                        <Field label="College / Institution ID" id="collegeId" value={collegeId} onChange={setCollegeId} placeholder="e.g. NITJ-2023" required />
                                        <Field label="Enrollment Number" id="enrollmentNumber" value={enrollmentNumber} onChange={setEnrollmentNumber} placeholder="e.g. 21CSIT001" required />
                                    </>
                                ) : (
                                    <>
                                        <Field label="Full Name (from Google)" id="teacherName" value={teacherName} onChange={() => {}} placeholder="" required readonly />
                                        <Field label="Teacher / Employee ID" id="teacherId" value={teacherId} onChange={setTeacherId} placeholder="e.g. FAC-2019-042" required />
                                    </>
                                )}
                            </div>

                            <button
                                type="submit"
                                id="submit-profile"
                                disabled={isSubmitting}
                                className="btn-primary"
                                style={{ width: '100%', padding: '14px', marginTop: '24px', fontSize: '1rem', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                            >
                                {isSubmitting ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                                        Saving...
                                    </span>
                                ) : 'Complete Registration →'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

// ── Reusable field component ─────────────────────────────────────────────────
function Field({
    label, id, value, onChange, placeholder, type = 'text', required, min, max, readonly,
}: {
    label: string; id: string; value: string;
    onChange: (v: string) => void; placeholder?: string;
    type?: string; required?: boolean; min?: number; max?: number; readonly?: boolean;
}) {
    return (
        <div>
            <label htmlFor={id} style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {label} {required && <span style={{ color: '#f87171' }}>*</span>}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                min={min}
                max={max}
                readOnly={readonly}
                className="input-field"
                style={{ 
                    width: '100%',
                    opacity: readonly ? 0.7 : 1,
                    cursor: readonly ? 'not-allowed' : 'text',
                    backgroundColor: readonly ? 'rgba(255,255,255,0.02)' : undefined
                }}
            />
        </div>
    );
}
