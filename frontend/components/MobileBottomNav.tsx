"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileUp, Plus, Bookmark, Code2 } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard",   label: "Home",    icon: Home },
  { href: "/my-uploads",  label: "Uploads", icon: FileUp },
  { href: "/bookmarks",   label: "Saved",   icon: Bookmark },
  { href: "/editor",      label: "Editor",  icon: Code2 },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#07070d]/95 backdrop-blur-xl border-t border-white/8 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 h-16">
        {/* Left two links */}
        {NAV_LINKS.slice(0, 2).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                active ? "text-[#b4afff]" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.25 : 1.75} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </Link>
          );
        })}

        {/* Center Upload FAB */}
        <Link
          href="/upload"
          className="flex flex-col items-center justify-center -mt-5 mx-2"
        >
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#5C55F9] shadow-[0_0_24px_-4px_rgba(92,85,249,0.65)] border border-white/10 transition-transform active:scale-95">
            <Plus className="w-5 h-5 text-white" strokeWidth={2.25} />
          </span>
          <span className="text-[10px] font-medium text-gray-500 mt-1 tracking-wide">Upload</span>
        </Link>

        {/* Right two links */}
        {NAV_LINKS.slice(2).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                active ? "text-[#b4afff]" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.25 : 1.75} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
