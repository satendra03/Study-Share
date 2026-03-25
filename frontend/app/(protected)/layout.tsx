"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!firebaseUser) {
        router.push("/");
      } else if (!appUser || !appUser.isProfileComplete) {
        router.push("/complete-profile");
      }
    }
  }, [loading, firebaseUser, appUser, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) return null;

  return (
    <div className="flex min-h-screen items-start bg-[#030303] text-white antialiased">
      <DashboardSidebar />
      <main className="flex-1 w-full min-w-0 max-w-full min-h-screen overflow-x-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
