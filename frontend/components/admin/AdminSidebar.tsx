"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import {
  LayoutDashboard,
  Users,
  FileText,
  GraduationCap,
  LogOut,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

const navLinks = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Materials", href: "/admin/materials", icon: FileText },
  { name: "Subjects", href: "/admin/semester-subjects", icon: BookOpen },
  { name: "Teachers", href: "/admin/teachers", icon: GraduationCap },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { adminUser, logout } = useAdminAuthStore();

  return (
    <aside className="w-[260px] hidden md:flex flex-col shrink-0 h-svh max-h-svh sticky top-0 self-start overflow-y-auto overflow-x-hidden border-r border-white/6 bg-linear-to-b from-[#0b0b10] via-[#060608] to-[#030303] shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-px bg-linear-to-b from-transparent via-[#5C55F9]/25 to-transparent opacity-80"
        aria-hidden
      />
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 bg-[radial-gradient(ellipse_120%_100%_at_0%_0%,rgba(92,85,249,0.07),transparent_65%)]" />

      {/* Header */}
      <div className="relative p-6 pb-4 border-b border-white/6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#5C55F9]/15 border border-[#5C55F9]/30 shrink-0">
            <ShieldCheck className="w-[18px] h-[18px] text-[#b4afff]" strokeWidth={1.75} />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight text-white">
              StudyShare
            </span>
            <p className="text-[10px] tracking-[0.22em] text-[#7a73f5] font-semibold uppercase mt-0.5">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-3 py-5 space-y-0.5">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Management
        </p>
        {navLinks.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group/nav flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-white bg-white/8 border border-[#5C55F9]/30 shadow-[0_0_20px_-8px_rgba(92,85,249,0.45)]"
                  : "text-gray-400 border border-transparent hover:text-gray-100 hover:bg-white/4 hover:border-white/6"
              }`}
            >
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-colors ${
                  isActive
                    ? "bg-[#5C55F9]/15 text-[#b4afff]"
                    : "bg-white/4 text-gray-500 group-hover/nav:text-gray-300"
                }`}
              >
                <Icon
                  className="w-[18px] h-[18px]"
                  strokeWidth={isActive ? 2.25 : 1.85}
                />
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative px-3 pb-6 mt-auto">
        <div className="rounded-2xl border border-white/8 bg-white/3 p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#5C55F9]/15 border border-[#5C55F9]/20 flex items-center justify-center text-[#b4afff] font-bold text-sm shrink-0">
              {adminUser?.displayName?.[0] || adminUser?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate tracking-tight">
                {adminUser?.displayName || "Admin"}
              </p>
              <p className="text-[10px] text-[#7a73f5] font-medium tracking-wide truncate uppercase mt-0.5">
                Administrator
              </p>
            </div>
          </div>
          <div className="border-t border-white/6 pt-3">
            <button
              type="button"
              onClick={() => void logout()}
              className="flex cursor-pointer items-center gap-3 w-full px-2 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors text-left rounded-lg hover:bg-red-950/20"
            >
              <LogOut className="w-4 h-4 text-gray-500 shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
