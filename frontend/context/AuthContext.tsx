"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { User } from "@/types";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  appUser: User | null;
  loading: boolean;
  profileLoaded: boolean;
  backendError: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setAppUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [backendError, setBackendError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setLoading(true);
        setBackendError(false);
        try {
        const token = await user.getIdToken();
        const res = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAppUser(res.data.data ?? null);
        setBackendError(false);
      } catch (error: unknown) {
        console.error("Error fetching profile on auth state change:", error);
        setAppUser(null);

        // Only mark backendError if the server is genuinely unreachable (network error).
        // HTTP errors (401, 404, 500, etc.) mean the backend IS running — just the 
        // request failed for auth/routing reasons, so backendError stays false.
        const axiosErr = error as { response?: { status?: number }; code?: string };
        const isNetworkError = !axiosErr.response || axiosErr.code === "ERR_NETWORK";
        setBackendError(isNetworkError);
      } finally {
        setLoading(false);
        setProfileLoaded(true);
      }
    } else {
      setAppUser(null);
      setLoading(false);
      setProfileLoaded(true);
    }
  });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await api.post("/auth/signin", { idToken });
      const userData = res.data.data as User & {
        firebaseUid?: string;
        email?: string;
        name?: string;
      };

      if (userData?.isProfileComplete === true) {
        setAppUser(userData as User);
        router.push("/dashboard");
        return;
      }

      if (userData?.isProfileComplete === false) {
        setAppUser(userData as User);
        router.push("/complete-profile");
        return;
      }

      sessionStorage.setItem("pendingIdToken", idToken);
      sessionStorage.setItem("pendingUser", JSON.stringify(userData));
      setAppUser(null);
      router.push("/complete-profile");
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setAppUser(null);
    sessionStorage.removeItem("pendingIdToken");
    sessionStorage.removeItem("pendingUser");
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        appUser,
        loading,
        profileLoaded,
        backendError,
        signInWithGoogle,
        logout,
        setAppUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
