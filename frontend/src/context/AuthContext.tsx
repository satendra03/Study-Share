'use client';

import React, { createContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/src/lib/firebase';
import { trackEvent, identifyUser, clearUser, AnalyticsEvents } from '@/src/lib/analytics';

// ── Types ────────────────────────────────────────────────────────────────────

export interface StudentProfile {
  fullName: string;
  semester: number;
  branch: string;
  collegeId: string;
  enrollmentNumber: string;
}

export interface TeacherProfile {
  fullName: string;
  teacherId: string;
}

export interface User {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  displayName: string;
  isVerified: boolean;
  isProfileComplete: boolean;
  photoURL?: string;
  studentProfile: StudentProfile | null;
  teacherProfile: TeacherProfile | null;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Set after Google sign-in when the user is NOT in the DB yet */
  pendingFirebaseUser: { firebaseUid: string; email: string; name?: string } | null;
  /** Firebase is signed-in, but backend sign-in failed (network/CORS/etc). */
  backendAuthError: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  retryBackendAuth: () => Promise<void>;
  /** Called from /complete-profile after a successful register API call */
  onProfileComplete: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ── Helper: call backend after Firebase sign-in ──────────────────────────────

async function signInWithBackend(
  idToken: string
): Promise<{ status: 'existing_user'; user: User } | { status: 'new_user'; firebaseUid: string; email: string; name: string }> {
  const url = `${API_BASE}/auth/signin`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      mode: 'cors',
    });
    if (!res.ok) {
      let body: any = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }
      const msg = body?.message || `Backend sign-in failed (${res.status})`;
      throw new Error(`${msg} — URL: ${url}`);
    }
    return res.json();
  } catch (e: any) {
    // Browser throws TypeError: Failed to fetch on network/CORS/DNS errors.
    const base = e?.message || 'Failed to fetch';
    if (String(base).includes('Failed to fetch')) {
      throw new Error(
        `Failed to reach backend at ${url}. Check backend is running, NEXT_PUBLIC_API_URL is correct, and CORS allows this origin.`
      );
    }
    throw e;
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingFirebaseUser, setPendingFirebaseUser] = useState<{ firebaseUid: string; email: string; name?: string } | null>(null);
  const [backendAuthError, setBackendAuthError] = useState<string | null>(null);
  const lastAttemptedUid = useRef<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        // Fallback: if auth doesn't resolve within 10 seconds, stop loading
        const timeout = setTimeout(() => {
            if (isMounted && isLoading) {
                console.warn('Auth loading timeout - forcing isLoading to false');
                setIsLoading(false);
            }
        }, 10000);

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (!isMounted) return;

            if (!firebaseUser) {
                setUser(null);
                setPendingFirebaseUser(null);
                setBackendAuthError(null);
                clearUser();
                setIsLoading(false);
                lastAttemptedUid.current = null;
                clearTimeout(timeout);
                return;
            }

            // Prevent multiple backend calls for the same user
            if (lastAttemptedUid.current === firebaseUser.uid) return;

            // Prevent multiple concurrent backend calls
            if (isLoading) return;

            lastAttemptedUid.current = firebaseUser.uid;

            try {
                setBackendAuthError(null);
                setIsLoading(true);

                const idToken = await firebaseUser.getIdToken();
                const result = await signInWithBackend(idToken);

                if (!isMounted) return;

                if (result.status === 'existing_user') {
                    setUser(result.user);
                    setPendingFirebaseUser(null);
                    if (result.user.id) {
                        identifyUser(result.user.id, result.user.displayName);
                    }
                    clearTimeout(timeout);
                } else {
                    // New user — needs to complete profile
                    setPendingFirebaseUser({ firebaseUid: result.firebaseUid, email: result.email, name: result.name });
                    setUser(null);
                    clearTimeout(timeout);
                }
            } catch (err) {
                if (!isMounted) return;

                console.error('Backend auth error:', err);
                // Keep Firebase session so user can retry when backend is up / URL fixed.
                setUser(null);
                setPendingFirebaseUser(null);
                setBackendAuthError(err instanceof Error ? err.message : 'Backend authentication failed');
                clearTimeout(timeout);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const loginWithGoogle = useCallback(async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        setIsLoading(true);
        try {
            await signInWithPopup(auth, provider);
            trackEvent(AnalyticsEvents.LOGIN, { method: 'google' });
        } catch (error) {
            setIsLoading(false);
            throw error; // Let the UI handle it (e.g., closing popup shouldn't break the app)
        }
    }, []);

    const logout = useCallback(async () => {
        trackEvent(AnalyticsEvents.LOGOUT);
        await signOut(auth);
        setUser(null);
        setPendingFirebaseUser(null);
        setBackendAuthError(null);
        clearUser();
    }, []);

  const retryBackendAuth = useCallback(async () => {
    const fbUser = auth.currentUser;
    if (!fbUser) return;
    setIsLoading(true);
    setBackendAuthError(null);
    try {
      const idToken = await fbUser.getIdToken(true);
      const result = await signInWithBackend(idToken);
      if (result.status === 'existing_user') {
        setUser(result.user);
        setPendingFirebaseUser(null);
        if (result.user.id) identifyUser(result.user.id, result.user.displayName);
      } else {
        setPendingFirebaseUser({ firebaseUid: result.firebaseUid, email: result.email, name: result.name });
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      setPendingFirebaseUser(null);
      setBackendAuthError(err instanceof Error ? err.message : 'Backend authentication failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Called by /complete-profile page when registration succeeds */
  const onProfileComplete = useCallback((completedUser: User) => {
    setUser(completedUser);
    setPendingFirebaseUser(null);
    setBackendAuthError(null);
    identifyUser(completedUser.id, completedUser.displayName);
  }, []);

  const contextValue = useMemo(() => ({
        user,
        isLoading,
        isAuthenticated: !!user,
        pendingFirebaseUser,
        backendAuthError,
        loginWithGoogle,
        logout,
        retryBackendAuth,
        onProfileComplete,
      }), [user, isLoading, pendingFirebaseUser, backendAuthError, loginWithGoogle, logout, retryBackendAuth, onProfileComplete]);

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
};
