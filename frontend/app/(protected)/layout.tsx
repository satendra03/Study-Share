"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardFooter from "@/components/DashboardFooter";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, appUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!firebaseUser) {
        router.push("/");
      } else {
        const profileComplete = Boolean(
          appUser?.isProfileComplete || appUser?.studentProfile || appUser?.teacherProfile,
        );
        if (!appUser || !profileComplete) {
          router.push("/complete-profile");
        }
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

  const isMaterialViewer = pathname?.startsWith("/materials/");

  return (
    <div className="flex min-h-screen items-start bg-[#030303] text-white antialiased">
      <DashboardSidebar />
      <div className="flex flex-col justify-between w-full h-screen overflow-hidden">
        <main className="flex-1 w-full min-w-0 max-w-full overflow-y-auto flex flex-col pt-0">
          {children}
        </main>
        {!isMaterialViewer && <DashboardFooter />}
      </div>
    </div>
  );
}
