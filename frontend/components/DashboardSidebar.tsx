"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Home, FileUp, Bookmark, Plus, HelpCircle, LogOut, Settings, Code2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import packageJson from "../package.json";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { appUser, firebaseUser, logout } = useAuthStore();

  const navLinks = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "My uploads", href: "/my-uploads", icon: FileUp },
    { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { name: "Code Editor", href: "/editor", icon: Code2 },
  ];


  const branch = appUser?.studentProfile?.branch;

  return (
    <aside className="w-[280px] hidden md:flex flex-col shrink-0 h-svh max-h-svh sticky top-0 self-start overflow-y-auto overflow-x-hidden border-r border-white/6 bg-linear-to-b from-[#0b0b10] via-[#060608] to-[#030303] shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-px bg-linear-to-b from-transparent via-[#5C55F9]/25 to-transparent opacity-80"
        aria-hidden
      />
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 bg-[radial-gradient(ellipse_120%_100%_at_0%_0%,rgba(92,85,249,0.07),transparent_65%)]" />

      <div className="relative p-6 pb-4 border-b border-white/6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/" className="group">
              <span className="text-xl font-semibold tracking-tight text-white group-hover:text-[#c4c2ff] transition-colors">
                StudyShare
              </span>
            </Link>
            <span
              className="text-[10px] font-mono font-medium uppercase tracking-[0.15em] text-gray-500 bg-white/5 border border-white/10 px-1.5 py-px rounded-lg leading-none"
              title="Version"
            >
              v{packageJson.version}
            </span>
          </div>
          <span className="text-[10px] tracking-[0.22em] text-[#7a73f5] font-semibold uppercase hover:text-[#a8a4fc] transition-colors">
            Workspace
          </span>
        </div>
      </div>

      <nav className="relative flex-1 px-3 py-5 space-y-0.5">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Navigate
        </p>
        {navLinks.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group/nav flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                  ? "text-white bg-white/8 border border-[#5C55F9]/30 shadow-[0_0_20px_-8px_rgba(92,85,249,0.45)]"
                  : "text-gray-400 border border-transparent hover:text-gray-100 hover:bg-white/4 hover:border-white/6"
                }`}
            >
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-colors ${isActive ? "bg-[#5C55F9]/15 text-[#b4afff]" : "bg-white/4 text-gray-500 group-hover/nav:text-gray-300"
                  }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.25 : 1.85} />
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="relative px-3 pb-6 space-y-5 mt-auto">
        <Link
          href="/upload"
          className="flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-medium px-4 py-3.5 hover:bg-[#4d46db] transition-all shadow-[0_0_28px_-6px_var(--primary)] w-full text-sm border border-white/10"
        >
          <Plus className="w-5 h-5" />
          Upload material
        </Link>

        <div className="rounded-2xl border border-white/8 bg-white/3 p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-11 h-11 border border-white/10 rounded-xl">
              <AvatarImage src={firebaseUser?.photoURL || ""} className="rounded-xl object-cover" />
              <AvatarFallback className="rounded-xl text-white font-semibold bg-[#1a1a24] text-sm">
                {appUser?.displayName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate tracking-tight">
                {appUser?.displayName || "User"}
              </p>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide truncate uppercase mt-0.5">
                {branch || appUser?.role || "Member"}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 border-t border-white/6 pt-3">
            <Link
              href="/contact"
              className="flex items-center gap-3 px-2 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <HelpCircle className="w-4 h-4 text-gray-500 shrink-0" /> Help
            </Link>
            {/* <button
              type="button"
              onClick={() => { }}
              className="flex cursor-pointer items-center gap-3 px-2 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <Settings className="w-4 h-4 text-gray-500 shrink-0" /> Settings
            </button> */}
            <button
              type="button"
              onClick={() => void logout()}
              className="flex cursor-pointer items-center gap-3 w-full px-2 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors text-left rounded-lg hover:bg-red-950/20"
            >
              <LogOut className="w-4 h-4 text-gray-500 shrink-0" /> Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
