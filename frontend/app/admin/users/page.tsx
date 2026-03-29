"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { auth } from "@/lib/firebase";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Shield,
  UserCheck,
  UserX,
  RefreshCw,
  ChevronDown,
  Mail,
  Calendar,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  id: string;
  firebaseUid: string;
  email: string;
  role: "student" | "teacher" | "admin";
  isVerified: boolean;
  isProfileComplete: boolean;
  displayName?: string;
  photoURL?: string;
  studentProfile?: { fullName: string; branch: string; semester: number; college: string; enrollmentNumber?: string };
  teacherProfile?: { fullName: string };
  createdAt?: any;
}

const ROLES = [
  { value: "all", label: "All Roles" },
  { value: "student", label: "Students" },
  { value: "teacher", label: "Teachers" },
];

const VERIFIED = [
  { value: "all", label: "All" },
  { value: "true", label: "Verified" },
  { value: "false", label: "Unverified" },
];

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[#12121a] border border-white/10 rounded-xl px-3 h-9 pr-8 text-sm text-white focus:outline-none focus:border-[#5C55F9]/50 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#12121a]">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
    </div>
  );
}

export default function AdminUsersPage() {
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [role, setRole] = useState("all");
  const [verified, setVerified] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const limit = 20;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!mounted) return;
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const params: Record<string, any> = { page, limit };
      if (role !== "all") params.role = role;
      if (verified !== "all") params.verified = verified;

      const res = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setUsers(res.data.data.users);
      setTotal(res.data.data.total);
    } catch (e: any) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [mounted, page, role, verified]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleVerify = async (userId: string, verify: boolean) => {
    setActionLoading(userId + "-verify");
    try {
      const token = await auth.currentUser?.getIdToken();
      await api.patch(
        `/admin/users/${userId}/verify`,
        { verified: verify },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(verify ? "User verified" : "User unverified");
      fetchUsers();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Delete user "${email}"? This cannot be undone.`)) return;
    setActionLoading(userId + "-delete");
    try {
      const token = await auth.currentUser?.getIdToken();
      await api.delete(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted");
      fetchUsers();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = search
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.displayName?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const totalPages = Math.ceil(total / limit);

  const roleColor = (r: string) => {
    if (r === "admin") return "bg-[#5C55F9]/15 text-[#b4afff] border-[#5C55F9]/20";
    if (r === "teacher") return "bg-purple-900/20 text-purple-300 border-purple-500/20";
    return "bg-white/5 text-gray-400 border-white/10";
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#5C55F9] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Header */}
      <div className="border-b border-white/6 bg-[#030303]/80 backdrop-blur-md sticky top-0 z-10 px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[#b4afff]" strokeWidth={1.75} />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Users</h1>
              <p className="text-xs text-gray-500">{total} total users</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by email or name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#12121a] border border-white/10 rounded-xl pl-8 pr-3 h-9 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5C55F9]/50 w-56"
              />
            </div>
            <FilterSelect value={role} onChange={(v) => { setRole(v); setPage(1); }} options={ROLES} />
            <FilterSelect value={verified} onChange={(v) => { setVerified(v); setPage(1); }} options={VERIFIED} />
            <button
              onClick={fetchUsers}
              className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 h-9 text-sm text-gray-400 hover:text-white hover:bg-white/8 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-7 h-7 text-[#5C55F9] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 text-gray-500">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No users found</p>
          </div>
        ) : (
          <>
            <div className="bg-[#0c0c14] border border-white/6 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/6">
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Profile</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-white/2 transition-colors group cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt=""
                              className="w-9 h-9 rounded-xl object-cover shrink-0 border border-white/8"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-[#1a1a24] border border-white/8 flex items-center justify-center text-sm font-semibold text-gray-300 shrink-0">
                              {(user.displayName || user.email)[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white truncate max-w-[180px]">
                              {user.role === "admin"
                                ? "Admin"
                                : user.studentProfile?.fullName || user.teacherProfile?.fullName || user.displayName || "—"}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[180px]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border capitalize ${roleColor(user.role)}`}>
                          {user.role === "admin" && <Shield className="w-3 h-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          {user.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-green-400">
                              <CheckCircle className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-orange-400">
                              <AlertTriangle className="w-3.5 h-3.5" /> Unverified
                            </span>
                          )}
                          {!user.isProfileComplete && (
                            <span className="text-[10px] text-gray-600">Profile incomplete</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className="text-xs text-gray-500">
                          {user.studentProfile
                            ? `${user.studentProfile.branch} · Sem ${user.studentProfile.semester}`
                            : user.teacherProfile
                            ? user.teacherProfile.fullName
                            : "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                          {user.role !== "admin" && (
                            <>
                              {user.isVerified ? (
                                <button
                                  onClick={() => handleVerify(user.id, false)}
                                  disabled={!!actionLoading}
                                  title="Unverify user"
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-orange-400 border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 transition-colors disabled:opacity-50"
                                >
                                  {actionLoading === user.id + "-verify" ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <UserX className="w-3.5 h-3.5" />
                                  )}
                                  Unverify
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleVerify(user.id, true)}
                                  disabled={!!actionLoading}
                                  title="Verify user"
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-green-400 border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-colors disabled:opacity-50"
                                >
                                  {actionLoading === user.id + "-verify" ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <UserCheck className="w-3.5 h-3.5" />
                                  )}
                                  Verify
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(user.id, user.email)}
                                disabled={!!actionLoading}
                                title="Delete user"
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === user.id + "-delete" ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                                Delete
                              </button>
                            </>
                          )}
                          {user.role === "admin" && (
                            <span className="text-xs text-gray-600 italic">Protected</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-400 border border-white/8 hover:border-white/15 hover:text-white disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <span className="text-sm text-gray-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-400 border border-white/8 hover:border-white/15 hover:text-white disabled:opacity-40 transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User detail dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="bg-[#0c0c14] border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-semibold">User Details</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-5 pt-1">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                {selectedUser.photoURL ? (
                  <img
                    src={selectedUser.photoURL}
                    alt=""
                    className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-2xl font-bold text-gray-300">
                    {(selectedUser.displayName || selectedUser.email)[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-base font-semibold text-white">
                    {selectedUser.role === "admin"
                      ? "Admin"
                      : selectedUser.studentProfile?.fullName || selectedUser.teacherProfile?.fullName || selectedUser.displayName || "—"}
                  </p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium border capitalize mt-1 ${roleColor(selectedUser.role)}`}>
                    {selectedUser.role === "admin" && <Shield className="w-3 h-3" />}
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              {/* Info rows */}
              <div className="space-y-3 bg-white/3 rounded-xl p-4 border border-white/6">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="text-sm text-gray-300 break-all">{selectedUser.email}</span>
                </div>

                <div className="flex items-center gap-3">
                  {selectedUser.isVerified ? (
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                  )}
                  <span className={`text-sm ${selectedUser.isVerified ? "text-green-400" : "text-orange-400"}`}>
                    {selectedUser.isVerified ? "Verified" : "Unverified"}
                  </span>
                </div>

                {selectedUser.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-sm text-gray-400">
                      Joined {new Date(selectedUser.createdAt?.seconds ? selectedUser.createdAt.seconds * 1000 : selectedUser.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                )}
              </div>

              {/* Student profile */}
              {selectedUser.studentProfile && (
                <div className="space-y-2 bg-white/3 rounded-xl p-4 border border-white/6">
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest font-medium flex items-center gap-1.5 mb-3">
                    <GraduationCap className="w-3.5 h-3.5" /> Student Profile
                  </p>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-gray-500">Branch</span>
                    <span className="text-gray-200">{selectedUser.studentProfile.branch}</span>
                    <span className="text-gray-500">Semester</span>
                    <span className="text-gray-200">{selectedUser.studentProfile.semester}</span>
                    {selectedUser.studentProfile.college && (
                      <>
                        <span className="text-gray-500">College</span>
                        <span className="text-gray-200">{selectedUser.studentProfile.college}</span>
                      </>
                    )}
                    {selectedUser.studentProfile.enrollmentNumber && (
                      <>
                        <span className="text-gray-500">Enrollment</span>
                        <span className="text-gray-200">{selectedUser.studentProfile.enrollmentNumber}</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Teacher profile */}
              {selectedUser.teacherProfile && (
                <div className="space-y-2 bg-white/3 rounded-xl p-4 border border-white/6">
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest font-medium flex items-center gap-1.5 mb-3">
                    <BookOpen className="w-3.5 h-3.5" /> Teacher Profile
                  </p>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-gray-500">Full Name</span>
                    <span className="text-gray-200">{selectedUser.teacherProfile.fullName}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
