"use client";
import { AdminAuthInitializer } from "@/components/AdminAuthInitializer";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { adminUser, loading } = useAdminAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!adminUser && pathname !== "/admin/login") {
        router.replace("/admin/login");
      }
      if (adminUser && pathname === "/admin/login") {
        router.replace("/admin/dashboard");
      }
    }
  }, [loading, adminUser, pathname, router]);

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
            <h3 className="text-xl font-semibold tracking-tight text-white drop-shadow-lg">
              StudyShare
            </h3>
            <div className="flex items-center gap-2.5 text-xs text-gray-400 font-medium tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#5C55F9] animate-ping" />
              Loading Admin Panel
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!adminUser && pathname !== "/admin/login") return null;

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#030303] text-white antialiased">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthInitializer>
      <>
        {/* Block admin panel on mobile / tablet */}
        <div className="lg:hidden fixed inset-0 z-[9999] bg-[#030303] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#5C55F9]/15 border border-[#5C55F9]/25 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[#b4afff]" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Desktop Only</h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            The admin panel requires a screen wider than a tablet. Please open it on a laptop or desktop.
          </p>
        </div>

        {/* Actual admin panel — only visible on lg+ */}
        <div className="hidden lg:block min-h-screen">
          <AdminGuard>{children}</AdminGuard>
        </div>
      </>
    </AdminAuthInitializer>
  );
}
