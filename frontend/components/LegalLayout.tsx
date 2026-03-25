"use client";

import { LandingNavbar } from "@/components/LandingNavbar";
import { Footer } from "@/components/footer";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import { ReactNode } from "react";

export interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <main className="min-h-screen relative bg-[#030303] text-white font-sans selection:bg-indigo-500/30">
        <div className="absolute top-0 left-0 z-0 h-[500px] w-full pointer-events-auto bg-[#030303]">
          <InteractiveGridPattern
             className="absolute inset-0 h-full w-full opacity-35 mix-blend-screen animate-in fade-in duration-1500 ease-in-out"
             width={60}
             height={60}
             squares={[40, 40]}
             squaresClassName="hover:fill-indigo-500/40 transition-colors duration-500 ease-in-out"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(92,85,249,0.15),transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-linear-to-t from-[#030303] via-[#030303]/80 to-transparent pointer-events-none" />
        </div>

        <LandingNavbar />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32">
          <div className="mb-16 border-b border-white/10 pb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">{title}</h1>
            <p className="text-gray-400">Effective Date: {lastUpdated}</p>
          </div>
          
          <article className="
            [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:text-white [&>h2]:mt-12 [&>h2]:mb-6 [&>h2]:border-b [&>h2]:border-white/5 [&>h2]:pb-4
            [&>h3]:text-xl [&>h3]:font-medium [&>h3]:text-white [&>h3]:mt-8 [&>h3]:mb-4
            [&>p]:text-gray-300 [&>p]:leading-relaxed [&>p]:mb-6
            [&>ul]:text-gray-300 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2 [&>ul>li]:leading-relaxed
            [&>ol]:text-gray-300 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2
            [&>a]:text-indigo-400 [&>a:hover]:text-indigo-300 transition-colors
            [&>strong]:text-white [&>strong]:font-semibold [&_strong]:text-white [&_strong]:font-semibold
          ">
            {children}
          </article>
        </div>

        <Footer />
    </main>
  );
}
