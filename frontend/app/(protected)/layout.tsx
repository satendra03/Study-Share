"use client";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardFooter from "@/components/DashboardFooter";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, appUser, loading, backendError } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // Not signed in at all → go home
      if (!firebaseUser) {
        router.push("/");
        return;
      }

      // Backend is down → redirect to home (protected routes can't function)
      if (backendError && !appUser) {
        router.push("/");
        return;
      }

      // No DB record yet (new user, backend is fine) → complete profile
      if (!appUser && !backendError) {
        router.push("/complete-profile");
        return;
      }

      // Profile genuinely not complete (appUser exists but incomplete)
      // Admins and teachers skip profile completion — they have no student/teacher profile
      if (
        appUser &&
        appUser.role !== "admin" &&
        appUser.role !== "teacher" &&
        !appUser.isProfileComplete &&
        !appUser.studentProfile &&
        !appUser.teacherProfile
      ) {
        router.push("/complete-profile");
        return;
      }
    }
  }, [loading, firebaseUser, appUser, backendError, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#5C55F9]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="relative flex items-center justify-center w-20 h-20">
            <div className="absolute inset-0 border-y-2 border-[#5C55F9]/40 w-full h-full rounded-full animate-spin animation-duration-[1.5s]" />
            <div className="absolute inset-0 border-x-2 border-[#5C55F9] w-full h-full rounded-full animate-spin animation-duration-[2s] direction-reverse" />
            <div className="w-10 h-10 bg-[#5C55F9]/40 rounded-full animate-pulse blur-md" />
            <div className="absolute w-6 h-6 bg-white rounded-full shadow-[0_0_20px_#5C55F9]" />
          </div>
          
          <div className="flex flex-col items-center gap-2.5">
            <h3 className="text-xl font-semibold tracking-tight text-white shadow-[#5C55F9]/20 drop-shadow-lg">
              StudyShare
            </h3>
            <div className="flex items-center gap-2.5 text-xs text-gray-400 font-medium tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#5C55F9] animate-ping" />
              Initializing Workspace
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not signed in → render nothing (useEffect redirects)
  if (!firebaseUser) return null;

  // Backend is down → render nothing (useEffect redirects)
  if (backendError && !appUser) return null;

  // No DB record (new user) → render nothing (useEffect redirects to complete-profile)
  if (!appUser) return null;

  // Profile not complete → render nothing (useEffect redirects) — skip for admin/teacher
  if (
    appUser.role !== "admin" &&
    appUser.role !== "teacher" &&
    !appUser.isProfileComplete &&
    !appUser.studentProfile &&
    !appUser.teacherProfile
  ) return null;

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
