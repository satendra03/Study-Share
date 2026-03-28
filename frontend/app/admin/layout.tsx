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
        router.push("/admin/login");
      }
      if (adminUser && pathname === "/admin/login") {
        router.push("/admin/dashboard");
      }
    }
  }, [loading, adminUser, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#5C55F9] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading admin panel…</p>
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
