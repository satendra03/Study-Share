"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, ArrowLeft, ArrowRight, Lock, ChevronDown } from "lucide-react";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import { SEMESTERS, BRANCHES } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

type Role = "student";

async function resolveIdToken(): Promise<string | null> {
  const pending = sessionStorage.getItem("pendingIdToken");
  if (pending) return pending;
  const u = auth.currentUser;
  if (!u) return null;
  return u.getIdToken();
}

/** Reusable form dropdown matching the dashboard style */
function FormDropdown({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select",
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const preventCloseRef = useRef(false);

  const displayText = value
    ? options.find((o) => o.value === value)?.label || value
    : placeholder;

  return (
    <div>
      <Label className="text-[10px] text-gray-500 uppercase tracking-widest font-medium block mb-1.5">{label}</Label>
      <DropdownMenu
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && preventCloseRef.current) {
            preventCloseRef.current = false;
            return;
          }
          setOpen(nextOpen);
        }}
      >
        <DropdownMenuTrigger className="inline-flex items-center justify-between w-full cursor-pointer bg-[#0f0f18] border border-white/8 rounded-lg px-3 h-10 text-sm hover:bg-[#13132a] transition-colors focus:outline-none focus:border-[#5C55F9]/40 select-none">
          <span className={value ? "text-white" : "text-gray-500"}>{displayText}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#0c0c14] border-white/10 min-w-[160px]">
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(v) => {
              preventCloseRef.current = true;
              onValueChange(v);
            }}
          >
            {options.map((opt) => (
              <DropdownMenuRadioItem
                key={opt.value}
                value={opt.value}
                className="text-gray-300 cursor-pointer focus:bg-[#5C55F9]/10 focus:text-white"
              >
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function CompleteProfilePage() {
  const [role] = useState<Role>("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { firebaseUser, appUser, loading: authLoading, backendError, setAppUser } = useAuth();

  const [studentForm, setStudentForm] = useState({
    fullName: "",
    semester: "",
    branch: "",
    collegeId: "",
    enrollmentNumber: "",
  });

  const [teacherForm, setTeacherForm] = useState({
    fullName: "",
  });

  useEffect(() => {
    if (firebaseUser) {
      const name = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "";
      const formatted = name.replace(/[._]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      setStudentForm((p) => ({ ...p, fullName: formatted }));
      setTeacherForm((p) => ({ ...p, fullName: formatted }));
    }
  }, [firebaseUser]);

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) { router.replace("/"); return; }
    if (backendError && !appUser) { router.replace("/"); return; }
    if (appUser?.isProfileComplete) { router.replace("/dashboard"); }
  }, [authLoading, firebaseUser, appUser, backendError, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dropdown fields (not covered by native 'required')
    if (role === "student" && (!studentForm.semester || !studentForm.branch)) {
      setError("Please select both semester and branch.");
      return;
    }

    const idToken = await resolveIdToken();
    if (!idToken) { setError("Session expired. Please sign in again."); return; }
    setLoading(true);
    setError("");
    try {
      const endpoint = role === "student" ? "/auth/register/student" : "/auth/register/teacher";
      const body = role === "student"
        ? { idToken, ...studentForm, semester: Number(studentForm.semester) }
        : { idToken, ...teacherForm };
      const res = await api.post(endpoint, body);
      setAppUser(res.data.data ?? null);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (firebaseUser && appUser?.isProfileComplete) || (backendError && !appUser)) {
    return (
      <div className="h-screen bg-[#030303] flex items-center justify-center">
        <div className="w-12 h-12 border-[3px] border-[#5C55F9]/20 border-t-[#5C55F9] rounded-full animate-spin" />
      </div>
    );
  }

  const nameValue = studentForm.fullName;

  return (
    <main className="h-screen bg-[#030303] text-white flex items-center justify-center overflow-hidden relative">
      {/* Full-page grid background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <InteractiveGridPattern
          className="absolute inset-0 w-full h-full opacity-[0.18] mix-blend-screen"
          width={48}
          height={48}
          squares={[40, 40]}
          squaresClassName="hover:fill-indigo-500/20 transition-colors duration-500"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(92,85,249,0.08),transparent_70%)]" />
      </div>

      {/* Centered content */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center gap-6 px-4">
        {/* Home link - above form, not in corner */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-all self-start bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:border-white/10 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Return to home
        </Link>

          {/* ── Form card ── */}
          <div className="w-full bg-[#0a0a10] border border-white/8 rounded-2xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 rounded-lg bg-[#5C55F9]/10">
                <GraduationCap className="w-4 h-4 text-[#a8a4fc]" />
              </div>
              <span className="text-sm font-medium">Student Registration</span>
            </div>

            {error && (
              <div className="mb-4 px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Locked name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Full Name</Label>
                  <span className="flex items-center gap-1 text-[9px] text-[#5C55F9] bg-[#5C55F9]/10 px-1.5 py-px rounded-full">
                    <Lock className="w-2 h-2" /> Synced
                  </span>
                </div>
                <Input
                  className="bg-[#0f0f18] border-white/8 text-gray-400 h-10 rounded-lg cursor-not-allowed text-sm"
                  value={nameValue}
                  readOnly
                />
              </div>

              {role === "student" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] text-gray-500 uppercase tracking-widest font-medium block mb-1.5">Enrollment</Label>
                    <Input placeholder="0101CS..." className="bg-[#0f0f18] border-white/8 text-white h-10 rounded-lg text-sm focus:border-[#5C55F9]/40 transition-colors" value={studentForm.enrollmentNumber} onChange={e => setStudentForm(p => ({ ...p, enrollmentNumber: e.target.value }))} required />
                  </div>

                  <FormDropdown
                    label="Semester"
                    value={studentForm.semester}
                    onValueChange={(v) => setStudentForm(p => ({ ...p, semester: v }))}
                    options={SEMESTERS.map(s => ({ value: s, label: `Sem ${s}` }))}
                    placeholder="Select"
                  />

                  <div className="col-span-2">
                    <FormDropdown
                      label="Branch"
                      value={studentForm.branch}
                      onValueChange={(v) => setStudentForm(p => ({ ...p, branch: v }))}
                      options={BRANCHES.map(b => ({ value: b, label: b }))}
                      placeholder="Select branch"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-[10px] text-gray-500 uppercase tracking-widest font-medium block mb-1.5">College</Label>
                    <Input placeholder="Your institution" className="bg-[#0f0f18] border-white/8 text-white h-10 rounded-lg text-sm focus:border-[#5C55F9]/40 transition-colors" value={studentForm.collegeId} onChange={e => setStudentForm(p => ({ ...p, collegeId: e.target.value }))} required />
                  </div>
                </div>
              }

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#5C55F9] hover:bg-[#4d46db] text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-[#5C55F9]/15 active:scale-[0.98] mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>

      </div>
    </main>
  );
}
