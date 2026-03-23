"use client";

import { useAuth } from "@/context/AuthContext";
import { LandingNavbar } from "@/components/LandingNavbar";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import { Footer } from "@/components/footer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  const { signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen relative bg-[#030303] text-white font-sans selection:bg-indigo-500/30 flex flex-col">
      <div className="relative w-full overflow-hidden flex-1 pb-24">
        {/* Background Grid strictly for Hero/Nav Area */}
        <div className="absolute top-0 left-0 z-0 h-[700px] w-full pointer-events-auto bg-[#030303]">
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

        {/* Navbar */}
        <LandingNavbar onSignIn={handleSignIn} />

        {/* 404 Content */}
        <section className="relative z-10 flex flex-col justify-center items-center text-center px-4 pt-32 pb-24 h-full min-h-[50vh]">
          {/* Giant background text overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] md:text-[25rem] font-bold text-white/3 select-none pointer-events-none tracking-tighter mix-blend-screen z-0 blur-[2px]">
            404
          </div>
          
          <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-400 mb-8 backdrop-blur-sm shadow-sm">
            <span>Error 404</span>
          </div>

          <h1 className="relative z-10 text-5xl md:text-7xl font-medium tracking-tight text-white mb-6 max-w-4xl leading-[1.1]">
            Page not found
          </h1>

          <p className="relative z-10 text-gray-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
          </p>

          <Link href="/" className="relative z-10 flex items-center gap-3 bg-white hover:bg-gray-100 text-black px-7 py-3.5 rounded-full font-medium transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] text-sm md:text-base cursor-pointer">
            <div className="bg-black/10 rounded-full p-0.5 flex items-center justify-center"><ArrowLeft className="w-4 h-4 text-black" strokeWidth={3} /></div> Go back home
          </Link>
        </section>
      </div>

      <Footer />
    </main>
  );
}
