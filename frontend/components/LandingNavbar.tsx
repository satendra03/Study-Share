"use client";

import { CustomLink } from "@/components/CustomLink";
import { Layers, Menu, X, LayoutDashboard, UserCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function LandingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { firebaseUser, appUser, loading, profileLoaded, backendError, signInWithGoogle } = useAuth();

  const isProfileComplete = Boolean(
    appUser?.isProfileComplete ||
      appUser?.studentProfile ||
      appUser?.teacherProfile ||
      false,
  );

  const isLoadingState = loading || (firebaseUser !== null && !profileLoaded);

  // Effective sign-in state: user is "signed in" only if Firebase auth is present
  // AND backend is reachable. If backend is down, treat as not signed in
  // since no authenticated features work anyway.
  const isEffectivelySignedIn = Boolean(firebaseUser && !backendError);

  const authActions = isLoadingState ? (
    <div className="hidden md:flex items-center justify-center px-6 py-2.5 rounded-full border border-gray-600/50 text-sm font-medium text-gray-400 backdrop-blur-sm cursor-not-allowed">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        Loading...
      </div>
    </div>
  ) : !isEffectivelySignedIn ? (
    <CustomLink
      href="/auth"
      className="hidden md:flex items-center justify-center px-6 py-2.5 rounded-full border border-gray-600/50 text-sm font-medium hover:bg-white/5 transition-all text-white backdrop-blur-sm cursor-pointer"
    >
      Sign In
    </CustomLink>
  ) : isProfileComplete ? (
    <CustomLink
      href="/dashboard"
      className="hidden md:flex items-center gap-2 justify-center px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-[#4d46db] transition-colors shadow-[0_0_24px_-6px_var(--primary)]"
    >
      <LayoutDashboard className="w-4 h-4" />
      Dashboard
    </CustomLink>
  ) : (
    <CustomLink
      href="/complete-profile"
      className="hidden md:flex items-center gap-2 justify-center px-6 py-2.5 rounded-full border border-indigo-500/50 text-sm font-medium text-indigo-200 hover:bg-indigo-500/10 transition-colors"
    >
      <UserCircle className="w-4 h-4" />
      Complete profile
    </CustomLink>
  );

  return (
    <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-6 max-w-350 mx-auto w-full">
      <div className="flex items-center gap-12">
        <CustomLink href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-white p-1.5 rounded-xl group-hover:scale-105 transition-transform flex items-center justify-center">
            <Layers className="text-[#030303] w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden md:block">StudyShare</span>
        </CustomLink>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400 font-medium z-50">
          <CustomLink href="/docs" className="hover:text-white transition-colors">
            Docs
          </CustomLink>
          <CustomLink href="/about" className="hover:text-white transition-colors">
            About
          </CustomLink>
          <CustomLink href="/pricing" className="hover:text-white transition-colors">
            Pricing
          </CustomLink>
          <CustomLink href="/contact" className="hover:text-white transition-colors">
            Contact
          </CustomLink>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {authActions}

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex items-center justify-center p-2 rounded-full border border-gray-600/50 text-white bg-white/5 backdrop-blur-sm transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 px-4 md:hidden">
          <div className="bg-[#050e1d]/95 backdrop-blur-xl border border-blue-900/30 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl">
            <div className="flex flex-col gap-4">
              <CustomLink href="/docs" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white transition-colors">
                Docs
              </CustomLink>
              <CustomLink href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white transition-colors">
                About
              </CustomLink>
              <CustomLink href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white transition-colors">
                Pricing
              </CustomLink>
              <CustomLink href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white transition-colors">
                Contact
              </CustomLink>
            </div>

            <div className="h-px w-full bg-white/10 my-1" />

            {isLoadingState ? (
              <div className="flex items-center justify-center w-full px-6 py-3.5 rounded-xl border border-gray-600/50 text-gray-400 font-medium cursor-not-allowed gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            ) : !isEffectivelySignedIn ? (
              <CustomLink
                href="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center w-full px-6 py-3.5 rounded-xl bg-primary text-white font-medium hover:bg-[#4d46db] transition-colors"
              >
                Sign In
              </CustomLink>
            ) : isProfileComplete ? (
              <CustomLink
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 justify-center w-full px-6 py-3.5 rounded-xl bg-primary text-white font-medium hover:bg-[#4d46db] transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </CustomLink>
            ) : (
              <CustomLink
                href="/complete-profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 justify-center w-full px-6 py-3.5 rounded-xl border border-indigo-500/40 text-indigo-200 font-medium hover:bg-indigo-500/10 transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                Complete profile
              </CustomLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
