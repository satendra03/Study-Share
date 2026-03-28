"use client";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { adminUser, loading } = useAdminAuth();
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
    <AdminAuthProvider>
      <AdminGuard>{children}</AdminGuard>
    </AdminAuthProvider>
  );
}
