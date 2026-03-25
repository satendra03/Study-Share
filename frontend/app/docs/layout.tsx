"use client";

import { LandingNavbar } from "@/components/LandingNavbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Search, ChevronRight, Book, Code, Bot, FolderUp } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { title: "Introduction", href: "/docs", icon: Book },
    { title: "Upload & Manage Materials", href: "/docs/materials", icon: FolderUp },
    { title: "AI Assistant", href: "/docs/ai", icon: Bot },
    { title: "API Reference", href: "/docs/api", icon: Code },
  ];

  const currentIndex = navItems.findIndex(item => item.href === pathname);
  const prevItem = currentIndex > 0 ? navItems[currentIndex - 1] : null;
  const nextItem = currentIndex !== -1 && currentIndex < navItems.length - 1 ? navItems[currentIndex + 1] : null;

  return (
    <div className="min-h-screen relative bg-[#030303] text-white selection:bg-indigo-500/30">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(92,85,249,0.1),transparent_70%)] opacity-60 z-0" />
      
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-[#030303]/80 backdrop-blur-xl border-b border-white/5 mx-auto">
        <LandingNavbar />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full flex relative z-10 transition-all">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-[260px] shrink-0 sticky top-[88px] h-[calc(100vh-88px)] overflow-y-auto py-10 pr-6 border-r border-white/5">
          <nav className="space-y-1">
            <h4 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Overview</h4>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const IconItem = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <IconItem className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-gray-500"}`} />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 py-10 lg:pl-12 text-gray-300">
          <div className="max-w-3xl">
            {children}
            
            {/* Standard Pagination/Navigation footer */}
            <hr className="my-10 border-white/5" />
            <div className="flex items-center justify-between text-sm py-4">
               <div>
                  {prevItem && (
                     <Link href={prevItem.href} className="flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors font-medium">
                        <ChevronRight className="w-4 h-4 rotate-180 text-gray-500" /> {prevItem.title}
                     </Link>
                  )}
               </div>
               <div>
                  {nextItem && (
                     <Link href={nextItem.href} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                        {nextItem.title} <ChevronRight className="w-4 h-4" />
                     </Link>
                  )}
               </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
