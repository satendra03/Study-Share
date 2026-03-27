"use client";

import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import { useEffect } from "react";

export default function AuthPage() {
  const { signInWithGoogle, firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (firebaseUser && !loading) {
      router.push("/dashboard");
    }
  }, [firebaseUser, loading, router]);

  return (
    <main className="min-h-screen relative bg-[#030303] text-white font-sans selection:bg-indigo-500/30 antialiased flex flex-col items-center justify-center p-4">
      {/* Background */}
      <div className="absolute top-0 left-0 z-0 h-full w-full pointer-events-auto bg-[#030303]">
        <InteractiveGridPattern
          className="absolute inset-0 h-full w-full opacity-35 mix-blend-screen animate-in fade-in duration-1500 ease-in-out"
          width={60}
          height={60}
          squares={[40, 40]}
          squaresClassName="hover:fill-indigo-500/40 transition-colors duration-500 ease-in-out"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(92,85,249,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-linear-to-t from-[#030303] via-[#030303]/80 to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* LOGO */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="text-3xl font-semibold tracking-tight text-white hover:text-[#c4c2ff] transition-colors">
            StudyShare
          </Link>
        </div>

        <div className="bg-[#111116]/80 p-8 rounded-3xl border border-white/10 shadow-[0_0_40px_-15px_rgba(92,85,249,0.2)] backdrop-blur-xl">
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight mb-2 text-center text-white">
            Create your account
          </h1>
          <p className="text-gray-400 text-sm text-center mb-8">
            Access study materials instantly safely & securely.
          </p>

          {/* Important Info Box */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 mb-8">
            <h3 className="text-indigo-300 font-medium text-sm flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Real Identity Recommended
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              To keep StudyShare safe and high-quality, please sign up using your real Name and Email ID.
            </p>
            <ul className="space-y-3 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong className="text-white font-medium">Unverified profiles</strong> can only upload a maximum of 5 PDFs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white font-medium">Verified profiles</strong> can upload and chat with materials an unlimited number of times.</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <span>Our admins periodically verify signed up profiles manually.</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            disabled={loading}
            className="w-full cursor-pointer flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black px-6 py-4 rounded-full font-semibold transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            )}
            {loading ? "Please wait..." : "Continue with Google"}
          </button>
          
          <p className="mt-6 text-center text-xs text-gray-500">
            By continuing, you agree to StudyShare's <Link href="/term-of-service" className="text-gray-400 hover:text-white underline underline-offset-2">Terms of Service</Link> and <Link href="/privacy-policy" className="text-gray-400 hover:text-white underline underline-offset-2">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
