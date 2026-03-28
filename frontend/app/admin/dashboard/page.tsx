"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { auth } from "@/lib/firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  FileText,
  Download,
  UserCheck,
  UserX,
  GraduationCap,
  BookOpen,
  Loader2,
  TrendingUp,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalMaterials: number;
  processingMaterials: number;
  failedMaterials: number;
  unverifiedUsers: number;
  unverifiedTeachers: number;
  totalDownloads: number;
  recentUploads: number;
  recentUsers: number;
}

const CHART_COLORS = ["#5C55F9", "#8b87ff", "#3d3ab5", "#c4c2ff", "#2a2870"];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  warn,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-5 bg-[#0c0c14] overflow-hidden transition-all ${warn
          ? "border-orange-500/20 shadow-[0_0_30px_-10px_rgba(249,115,22,0.2)]"
          : accent
            ? "border-[#5C55F9]/30 shadow-[0_0_30px_-10px_rgba(92,85,249,0.25)]"
            : "border-white/6"
        }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-2">
            {label}
          </p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1.5">{sub}</p>}
        </div>
        <div
          className={`flex items-center justify-center w-11 h-11 rounded-xl ${warn
              ? "bg-orange-500/10 text-orange-400"
              : accent
                ? "bg-[#5C55F9]/15 text-[#b4afff]"
                : "bg-white/5 text-gray-400"
            }`}
        >
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>
      </div>
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 ${warn
            ? "bg-linear-to-r from-transparent via-orange-500/40 to-transparent"
            : accent
              ? "bg-linear-to-r from-transparent via-[#5C55F9]/40 to-transparent"
              : "bg-linear-to-r from-transparent via-white/10 to-transparent"
          }`}
      />
    </div>
  );
}

export default function AdminDashboard() {
  const { adminUser } = useAdminAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await api.get("/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data.data);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#5C55F9] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const userBreakdown = stats
    ? [
      { name: "Students", value: stats.totalStudents },
      { name: "Teachers", value: stats.totalTeachers },
    ]
    : [];

  const materialStatus = stats
    ? [
      {
        name: "Status",
        Processing: stats.processingMaterials,
        Failed: stats.failedMaterials,
        Done:
          stats.totalMaterials -
          stats.processingMaterials -
          stats.failedMaterials,
      },
    ]
    : [];

  const weeklyData = stats
    ? [
      { name: "New Users", value: stats.recentUsers },
      { name: "Uploads", value: stats.recentUploads },
    ]
    : [];

  const verificationData = stats
    ? [
      { name: "Verified", value: stats.totalUsers - stats.unverifiedUsers },
      { name: "Unverified", value: stats.unverifiedUsers },
    ]
    : [];

  const tooltipStyle = {
    backgroundColor: "#0c0c14",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "12px",
  };

  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Header */}
      <div className="border-b border-white/6 bg-[#030303]/80 backdrop-blur-md sticky top-0 z-10 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Welcome back, {adminUser?.displayName || adminUser?.email}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/4 border border-white/8 rounded-lg px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live stats
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats?.totalUsers ?? 0}
            sub={`+${stats?.recentUsers ?? 0} this week`}
            accent
          />
          <StatCard
            icon={BookOpen}
            label="Students"
            value={stats?.totalStudents ?? 0}
          />
          <StatCard
            icon={GraduationCap}
            label="Teachers"
            value={stats?.totalTeachers ?? 0}
          />
          <StatCard
            icon={UserX}
            label="Unverified"
            value={stats?.unverifiedUsers ?? 0}
            sub={`${stats?.unverifiedTeachers ?? 0} teachers pending`}
            warn={(stats?.unverifiedUsers ?? 0) > 0}
          />
          <StatCard
            icon={FileText}
            label="Total Materials"
            value={stats?.totalMaterials ?? 0}
            sub={`+${stats?.recentUploads ?? 0} this week`}
            accent
          />
          <StatCard
            icon={Clock}
            label="Processing"
            value={stats?.processingMaterials ?? 0}
            sub="Documents being processed"
            warn={(stats?.processingMaterials ?? 0) > 0}
          />
          <StatCard
            icon={AlertTriangle}
            label="Failed"
            value={stats?.failedMaterials ?? 0}
            sub="Processing failed"
            warn={(stats?.failedMaterials ?? 0) > 0}
          />
          <StatCard
            icon={Download}
            label="Total Downloads"
            value={stats?.totalDownloads ?? 0}
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User breakdown pie */}
          <div className="bg-[#0c0c14] border border-white/6 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-1">User Breakdown</h3>
            <p className="text-xs text-gray-500 mb-5">Students vs Teachers</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={userBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {userBreakdown.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: "#9ca3af", fontSize: "12px" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Verification status pie */}
          <div className="bg-[#0c0c14] border border-white/6 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-1">Verification Status</h3>
            <p className="text-xs text-gray-500 mb-5">Verified vs Unverified users</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={verificationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill="#5C55F9" />
                  <Cell fill="#f97316" />
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: "#9ca3af", fontSize: "12px" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Material status bar */}
          <div className="bg-[#0c0c14] border border-white/6 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-1">Material Status</h3>
            <p className="text-xs text-gray-500 mb-5">Processing, Failed, Done</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={materialStatus} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="Done" fill="#5C55F9" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Processing" fill="#f97316" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Failed" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* This week bar */}
          <div className="bg-[#0c0c14] border border-white/6 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[#5C55F9]" />
              <h3 className="text-sm font-semibold text-white">This Week</h3>
            </div>
            <p className="text-xs text-gray-500 mb-5">New users & uploads (last 7 days)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="value" fill="#5C55F9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-[#0c0c14] border border-white/6 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Manage Users", href: "/admin/users", icon: Users, desc: "Verify & manage accounts" },
              { label: "Manage Materials", href: "/admin/materials", icon: FileText, desc: "View & delete docs" },
              { label: "Add Teacher", href: "/admin/teachers", icon: GraduationCap, desc: "Create teacher accounts" },
              {
                label: "Pending Verifications",
                href: "/admin/users?verified=false",
                icon: UserCheck,
                desc: `${stats?.unverifiedUsers ?? 0} users pending`,
                warn: (stats?.unverifiedUsers ?? 0) > 0,
              },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className={`flex flex-col gap-2 p-4 rounded-xl border transition-all hover:bg-white/4 ${action.warn
                    ? "border-orange-500/20 hover:border-orange-500/30"
                    : "border-white/6 hover:border-white/12"
                  }`}
              >
                <action.icon
                  className={`w-5 h-5 ${action.warn ? "text-orange-400" : "text-[#b4afff]"}`}
                  strokeWidth={1.75}
                />
                <div>
                  <p className="text-sm font-medium text-white">{action.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
