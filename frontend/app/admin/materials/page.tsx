"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { auth } from "@/lib/firebase";
import {
  FileText,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

interface Material {
  _id: string;
  title?: string;
  description: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploaderId: string;
  uploaderName?: string;
  status: "processing" | "done" | "failed";
  branch?: string;
  semester?: string;
  subject?: string;
  downloads?: number;
  createdAt?: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "done", label: "Done" },
  { value: "processing", label: "Processing" },
  { value: "failed", label: "Failed" },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "done")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
        <CheckCircle className="w-3 h-3" /> Done
      </span>
    );
  if (status === "processing")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
        <Clock className="w-3 h-3 animate-spin" /> Processing
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
      <XCircle className="w-3 h-3" /> Failed
    </span>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMaterialsPage() {
  const [mounted, setMounted] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const limit = 20;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchMaterials = useCallback(async () => {
    if (!mounted) return;
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const params: Record<string, any> = { page, limit };
      if (status !== "all") params.status = status;
      const res = await api.get("/admin/materials", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setMaterials(res.data.data.materials);
      setTotal(res.data.data.total);
    } catch {
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  }, [mounted, page, status]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleDelete = async (materialId: string, title: string) => {
    if (!confirm(`Delete "${title || materialId}"? This cannot be undone.`)) return;
    setActionLoading(materialId);
    try {
      const token = await auth.currentUser?.getIdToken();
      await api.delete(`/admin/materials/${materialId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Material deleted");
      fetchMaterials();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = search
    ? materials.filter(
        (m) =>
          (m.title || m.fileName).toLowerCase().includes(search.toLowerCase()) ||
          m.uploaderName?.toLowerCase().includes(search.toLowerCase()) ||
          m.subject?.toLowerCase().includes(search.toLowerCase())
      )
    : materials;

  const totalPages = Math.ceil(total / limit);

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
            <FileText className="w-5 h-5 text-[#b4afff]" strokeWidth={1.75} />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Materials</h1>
              <p className="text-xs text-gray-500">{total} total documents</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by title, subject, uploader…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#12121a] border border-white/10 rounded-xl pl-8 pr-3 h-9 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5C55F9]/50 w-64"
              />
            </div>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="appearance-none bg-[#12121a] border border-white/10 rounded-xl px-3 h-9 pr-8 text-sm text-white focus:outline-none focus:border-[#5C55F9]/50 cursor-pointer"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#12121a]">
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
            <button
              onClick={fetchMaterials}
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
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No materials found</p>
          </div>
        ) : (
          <>
            <div className="bg-[#0c0c14] border border-white/6 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/6">
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Uploader</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Info</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {filtered.map((mat) => (
                    <tr key={mat._id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#1a1a24] border border-white/8 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-[#b4afff]" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white truncate max-w-[200px]">
                              {mat.title || mat.fileName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {mat.subject || mat.fileType} · {formatSize(mat.fileSize)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-sm text-gray-300">{mat.uploaderName || mat.uploaderId}</p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={mat.status} />
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className="text-xs text-gray-500">
                          {[mat.branch, mat.semester ? `Sem ${mat.semester}` : null]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                          <Download className="w-3 h-3" />
                          {mat.downloads ?? 0} downloads
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <a
                            href={mat.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 border border-white/10 bg-white/4 hover:bg-white/8 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View
                          </a>
                          <button
                            onClick={() => handleDelete(mat._id, mat.title || mat.fileName)}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === mat._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            Delete
                          </button>
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
                  <span className="text-sm text-gray-500">{page} / {totalPages}</span>
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
    </div>
  );
}
