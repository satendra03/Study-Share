"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { auth } from "@/lib/firebase";
import {
  GraduationCap,
  Plus,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

interface Teacher {
  id: string;
  email: string;
  displayName?: string;
  teacherProfile?: { fullName: string; teacherId: string };
  isVerified: boolean;
  createdAt?: any;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Create form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
        params: { role: "teacher", limit: 50, page: 1 },
      });
      setTeachers(res.data.data.users);
      setTotal(res.data.data.total);
    } catch {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setCreating(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      await api.post(
        "/admin/teachers",
        { email, password, fullName, teacherId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormSuccess(`Teacher account created for ${email}`);
      setEmail("");
      setPassword("");
      setFullName("");
      setTeacherId("");
      fetchTeachers();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Failed to create teacher");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Header */}
      <div className="border-b border-white/6 bg-[#030303]/80 backdrop-blur-md sticky top-0 z-10 px-8 py-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-5 h-5 text-[#b4afff]" strokeWidth={1.75} />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Teachers</h1>
            <p className="text-xs text-gray-500">
              Create teacher accounts · {total} total
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Create form */}
        <div className="bg-[#0c0c14] border border-white/6 rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#5C55F9]/15 border border-[#5C55F9]/30 flex items-center justify-center">
              <Plus className="w-4.5 h-4.5 text-[#b4afff]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Create Teacher Account</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Teacher will sign in with email & password
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            {formError && (
              <div className="flex items-start gap-2.5 bg-red-950/40 border border-red-500/20 rounded-xl px-3.5 py-3 text-sm text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="flex items-start gap-2.5 bg-green-950/40 border border-green-500/20 rounded-xl px-3.5 py-3 text-sm text-green-300">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                {formSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Priya Sharma"
                  required
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 h-11 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5C55F9]/50 focus:ring-1 focus:ring-[#5C55F9]/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Teacher ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  placeholder="e.g. TCH-001"
                  required
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 h-11 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5C55F9]/50 focus:ring-1 focus:ring-[#5C55F9]/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@college.edu"
                required
                className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 h-11 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5C55F9]/50 focus:ring-1 focus:ring-[#5C55F9]/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 pr-11 h-11 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5C55F9]/50 focus:ring-1 focus:ring-[#5C55F9]/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1.5">
                The teacher will use this email & password to sign in to StudyShare.
              </p>
            </div>

            <div className="pt-1 bg-[#5C55F9]/5 border border-[#5C55F9]/15 rounded-xl px-4 py-3 text-xs text-gray-400 space-y-1">
              <p className="font-medium text-[#b4afff]">What happens after creation:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>A Firebase account is created with email/password</li>
                <li>Teacher is automatically verified and can upload materials</li>
                <li>Teacher signs in at <code className="text-[#b4afff]">/auth</code> using email & password</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-[#5C55F9] hover:bg-[#4d46db] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl h-11 text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_24px_-6px_rgba(92,85,249,0.5)] border border-white/10 mt-2"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Teacher Account
                </>
              )}
            </button>
          </form>
        </div>

        {/* Teachers list */}
        <div className="bg-[#0c0c14] border border-white/6 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#b4afff]" strokeWidth={1.75} />
              <h2 className="text-sm font-semibold text-white">All Teachers</h2>
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{total}</span>
            </div>
            <button
              onClick={fetchTeachers}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-[#5C55F9] animate-spin" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No teachers yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/4 max-h-[600px] overflow-y-auto">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/2 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#1a1a24] border border-white/8 flex items-center justify-center text-sm font-semibold text-gray-300 shrink-0">
                    {(teacher.displayName || teacher.email)[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {teacher.teacherProfile?.fullName || teacher.displayName || "—"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{teacher.email}</p>
                    {teacher.teacherProfile?.teacherId && (
                      <p className="text-[10px] text-gray-600 mt-0.5">
                        ID: {teacher.teacherProfile.teacherId}
                      </p>
                    )}
                  </div>
                  <div>
                    {teacher.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-green-400">
                        <UserCheck className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-orange-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
