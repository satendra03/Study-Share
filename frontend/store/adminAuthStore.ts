import { create } from "zustand";
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
  role: "admin" | "teacher";
  displayName?: string;
}

interface AdminAuthState {
  adminUser: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  adminUser: null,
  loading: true,

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const appUser = res.data?.data;
          if (appUser?.role === "admin" || appUser?.role === "teacher") {
            set({ adminUser: appUser as AdminUser });
          } else {
            set({ adminUser: null });
          }
        } catch {
          set({ adminUser: null });
        }
      } else {
        set({ adminUser: null });
      }
      set({ loading: false });
    });
    return unsubscribe;
  },

  signIn: async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdToken();
    const res = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const appUser = res.data?.data;
    if (!appUser || (appUser.role !== "admin" && appUser.role !== "teacher")) {
      await signOut(auth);
      throw new Error("Access denied. Admin accounts only.");
    }
    set({ adminUser: appUser as AdminUser });
  },

  logout: async () => {
    await signOut(auth);
    set({ adminUser: null });
  },
}));
