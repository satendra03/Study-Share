"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, GraduationCap, Briefcase, ArrowLeft } from "lucide-react";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";

type Role = "student" | "teacher" | null;

async function resolveIdToken(): Promise<string | null> {
  const pending = sessionStorage.getItem("pendingIdToken");
  if (pending) return pending;
  const u = auth.currentUser;
  if (!u) return null;
  return u.getIdToken();
}

export default function CompleteProfilePage() {
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { firebaseUser, appUser, loading: authLoading, setAppUser } = useAuth();

  const [studentForm, setStudentForm] = useState({
    fullName: "",
    semester: "",
    branch: "",
    collegeId: "",
    enrollmentNumber: "",
  });

  const [teacherForm, setTeacherForm] = useState({
    fullName: "",
    teacherId: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      router.replace("/");
      return;
    }
    if (appUser?.isProfileComplete) {
      router.replace("/dashboard");
    }
  }, [authLoading, firebaseUser, appUser, router]);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idToken = await resolveIdToken();
    if (!idToken) {
      setError("Session expired. Please sign in again from the home page.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/register/student", {
        idToken,
        ...studentForm,
        semester: Number(studentForm.semester),
      });
      setAppUser(res.data.data ?? null);
      sessionStorage.removeItem("pendingIdToken");
      sessionStorage.removeItem("pendingUser");
      router.push("/dashboard");
    } catch (err: unknown) {
      const er = err as { response?: { data?: { message?: string } } };
      setError(er.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idToken = await resolveIdToken();
    if (!idToken) {
      setError("Session expired. Please sign in again from the home page.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/register/teacher", { idToken, ...teacherForm });
      setAppUser(res.data.data ?? null);
      sessionStorage.removeItem("pendingIdToken");
      sessionStorage.removeItem("pendingUser");
      router.push("/dashboard");
    } catch (err: unknown) {
      const er = err as { response?: { data?: { message?: string } } };
      setError(er.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (firebaseUser && appUser?.isProfileComplete)) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#5C55F9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen relative bg-[#030303] text-white flex items-center justify-center px-4 py-16 selection:bg-indigo-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <InteractiveGridPattern
          className="absolute inset-0 opacity-[0.2] mix-blend-screen"
          width={56}
          height={56}
          squares={[36, 36]}
          squaresClassName="hover:fill-indigo-500/30 transition-colors duration-500"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(92,85,249,0.14),transparent_55%)]" />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col gap-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

      <Card className="w-full bg-[#0c0c10]/95 border-white/10 text-white shadow-[0_0_80px_-30px_rgba(92,85,249,0.35)] backdrop-blur-md">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
              <BookOpen className="text-[#a8a4fc] w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-medium tracking-tight">Finish setting up</CardTitle>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            After Google sign-in, we need a few details so uploads and bookmarks stay on the right account.
          </p>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-300 text-sm mb-4 bg-red-950/50 border border-red-900/40 px-3 py-2 rounded-lg">{error}</p>}

          {!role && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("student")}
                className="flex flex-col items-center gap-3 p-6 border border-white/10 hover:border-[#5C55F9]/50 rounded-2xl transition-all bg-white/2 hover:bg-[#5C55F9]/5"
              >
                <GraduationCap className="w-10 h-10 text-[#a8a4fc]" />
                <span className="font-semibold text-white">Student</span>
                <span className="text-gray-400 text-xs text-center">Browse, bookmark, and download materials</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className="flex flex-col items-center gap-3 p-6 border border-white/10 hover:border-[#5C55F9]/50 rounded-2xl transition-all bg-white/2 hover:bg-[#5C55F9]/5"
              >
                <Briefcase className="w-10 h-10 text-[#a8a4fc]" />
                <span className="font-semibold text-white">Teacher</span>
                <span className="text-gray-400 text-xs text-center">Upload and share learning materials</span>
              </button>
            </div>
          )}

          {role === "student" && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <button type="button" onClick={() => setRole(null)} className="text-sm text-[#a8a4fc] hover:text-white mb-1">
                ← Change role
              </button>
              {[
                { label: "Full Name", key: "fullName", placeholder: "Your full name" },
                { label: "Enrollment Number", key: "enrollmentNumber", placeholder: "e.g. 0101CS221234" },
                { label: "Branch", key: "branch", placeholder: "e.g. Computer Science" },
                { label: "Semester", key: "semester", placeholder: "e.g. 4", type: "number" },
                { label: "College ID / Name", key: "collegeId", placeholder: "Your college" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <Label className="text-gray-300 text-sm">{label}</Label>
                  <Input
                    className="bg-black/30 border-white/10 text-white mt-1.5 rounded-xl"
                    placeholder={placeholder}
                    type={type || "text"}
                    value={(studentForm as Record<string, string>)[key]}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    required
                  />
                </div>
              ))}
              <Button type="submit" disabled={loading} className="w-full rounded-xl bg-primary hover:bg-[#4d46db] text-white font-medium mt-2">
                {loading ? "Saving…" : "Save and continue"}
              </Button>
            </form>
          )}

          {role === "teacher" && (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <button type="button" onClick={() => setRole(null)} className="text-sm text-[#a8a4fc] hover:text-white mb-1">
                ← Change role
              </button>
              {[
                { label: "Full Name", key: "fullName", placeholder: "Your full name" },
                { label: "Teacher ID", key: "teacherId", placeholder: "Your staff/employee ID" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <Label className="text-gray-300 text-sm">{label}</Label>
                  <Input
                    className="bg-black/30 border-white/10 text-white mt-1.5 rounded-xl"
                    placeholder={placeholder}
                    value={(teacherForm as Record<string, string>)[key]}
                    onChange={(e) => setTeacherForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    required
                  />
                </div>
              ))}
              <Button type="submit" disabled={loading} className="w-full rounded-xl bg-primary hover:bg-[#4d46db] text-white font-medium mt-2">
                {loading ? "Saving…" : "Save and continue"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      </div>
    </main>
  );
}
