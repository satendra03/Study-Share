import { create } from "zustand";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { User } from "@/types";
import api from "@/lib/api";

interface AuthState {
  firebaseUser: FirebaseUser | null;
  appUser: User | null;
  loading: boolean;
  profileLoaded: boolean;
  backendError: boolean;
  // actions
  setAppUser: (user: User | null) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => () => void; // returns unsubscribe fn
}

export const useAuthStore = create<AuthState>((set, get) => ({
  firebaseUser: null,
  appUser: null,
  loading: true,
  profileLoaded: false,
  backendError: false,

  setAppUser: (user) => set({ appUser: user }),

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      set({ firebaseUser: user });
      if (user) {
        set({ loading: true, backendError: false });
        try {
          const token = await user.getIdToken();
          const res = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ appUser: res.data.data ?? null, backendError: false });
        } catch (error: unknown) {
          set({ appUser: null });
          const axiosErr = error as { response?: { status?: number }; code?: string };
          const isNetworkError = !axiosErr.response || axiosErr.code === "ERR_NETWORK";
          set({ backendError: isNetworkError });
        } finally {
          set({ loading: false, profileLoaded: true });
        }
      } else {
        set({ appUser: null, loading: false, profileLoaded: true });
      }
    });
    return unsubscribe;
  },

  signInWithGoogle: async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    const res = await api.post("/auth/signin", { idToken });
    const userData = res.data.data as User & {
      firebaseUid?: string;
      email?: string;
      name?: string;
    };

    if (userData?.isProfileComplete === true) {
      set({ appUser: userData as User });
      window.location.href = "/dashboard";
      return;
    }

    if (userData?.isProfileComplete === false) {
      set({ appUser: userData as User });
      window.location.href = "/complete-profile";
      return;
    }

    sessionStorage.setItem("pendingIdToken", idToken);
    sessionStorage.setItem("pendingUser", JSON.stringify(userData));
    set({ appUser: null });
    window.location.href = "/complete-profile";
  },

  signInWithEmail: async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    const res = await api.post("/auth/signin", { idToken });
    const userData = res.data.data as User;

    if (userData?.isProfileComplete === true) {
      set({ appUser: userData as User });
      window.location.href = "/dashboard";
      return;
    }

    sessionStorage.setItem("pendingIdToken", idToken);
    sessionStorage.setItem("pendingUser", JSON.stringify(userData));
    set({ appUser: null });
    window.location.href = "/complete-profile";
  },

  logout: async () => {
    await signOut(auth);
    set({ appUser: null, firebaseUser: null });
    sessionStorage.removeItem("pendingIdToken");
    sessionStorage.removeItem("pendingUser");
    window.location.href = "/";
  },
}));
