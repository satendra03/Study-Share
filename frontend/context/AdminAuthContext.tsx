"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import api from "@/lib/api";

interface AdminUser {
  id: string;
  firebaseUid: string;
  email: string;
  role: "admin";
  displayName?: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const appUser = res.data?.data;
          if (appUser?.role === "admin") {
            setAdminUser(appUser as AdminUser);
          } else {
            setAdminUser(null);
          }
        } catch {
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdToken();
    const res = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const appUser = res.data?.data;
    if (!appUser || appUser.role !== "admin") {
      await signOut(auth);
      throw new Error("Access denied. Admin accounts only.");
    }
    setAdminUser(appUser as AdminUser);
  };

  const logout = async () => {
    await signOut(auth);
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, loading, signIn, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
