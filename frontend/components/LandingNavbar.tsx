"use client";

import Link from "next/link";
import { Layers, Menu, X } from "lucide-react";
import { useState } from "react";

export interface LandingNavbarProps {
  onSignIn: () => void;
}

export function LandingNavbar({ onSignIn }: LandingNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-6 max-w-[1400px] mx-auto w-full">
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-white p-1.5 rounded-xl group-hover:scale-105 transition-transform flex items-center justify-center">
            <Layers className="text-[#030303] w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden md:block">StudyShare</span>
        </Link>
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400 font-medium z-50">
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Desktop Button */}
        <button
          onClick={onSignIn}
          className="hidden md:flex items-center justify-center px-6 py-2.5 rounded-full border border-gray-600/50 text-sm font-medium hover:bg-white/5 transition-all text-white backdrop-blur-sm cursor-pointer"
        >
          Sign In
        </button>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex items-center justify-center p-2 rounded-full border border-gray-600/50 text-white bg-white/5 backdrop-blur-sm transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 px-4 md:hidden">
          <div className="bg-[#050e1d]/95 backdrop-blur-xl border border-blue-900/30 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl">
            <div className="flex flex-col gap-4">
              <Link href="/docs" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white transition-colors">Docs</Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white transition-colors">About</Link>
              <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white transition-colors">Pricing</Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white transition-colors">Contact</Link>
            </div>
            
            <div className="h-px w-full bg-white/10 my-1"></div>
            
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onSignIn();
              }}
              className="flex items-center justify-center w-full px-6 py-3.5 rounded-xl bg-primary text-white font-medium hover:bg-[#4d46db] transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
