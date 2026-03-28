"use client";
import { useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const { signIn, loading } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSigningIn(true);
    try {
      await signIn(email, password);
      router.replace("/admin/dashboard");
    } catch (err: any) {
      const msg = err?.message || "Sign in failed";
      if (msg.includes("Access denied")) {
        setError("Access denied. This portal is for admins only.");
      } else if (msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found")) {
        setError("Invalid email or password.");
      } else {
        setError(msg);
      }
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5C55F9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center relative overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5C55F9]/8 blur-[120px] rounded-full" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#5C55F9]/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-900/10 blur-[100px] rounded-full" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#5C55F9]/15 border border-[#5C55F9]/30 mb-4 shadow-[0_0_40px_-8px_rgba(92,85,249,0.5)]">
            <ShieldCheck className="w-8 h-8 text-[#b4afff]" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">StudyShare — Restricted Access</p>
        </div>

        {/* Card */}
        <div className="bg-[#0c0c14] border border-white/8 rounded-2xl p-7 shadow-[0_0_60px_-20px_rgba(92,85,249,0.2)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 bg-red-950/40 border border-red-500/20 rounded-xl px-3.5 py-3 text-sm text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@studyshare.com"
                  required
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl pl-10 pr-4 h-11 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5C55F9]/50 focus:ring-1 focus:ring-[#5C55F9]/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl pl-10 pr-11 h-11 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5C55F9]/50 focus:ring-1 focus:ring-[#5C55F9]/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={signingIn || !email || !password}
              className="w-full bg-[#5C55F9] hover:bg-[#4d46db] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl h-11 text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_28px_-6px_rgba(92,85,249,0.6)] border border-white/10"
            >
              {signingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Sign in to Admin Panel
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          This portal is restricted to authorized administrators only.
        </p>
      </div>
    </div>
  );
}
