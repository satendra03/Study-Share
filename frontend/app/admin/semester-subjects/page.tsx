"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback, useRef } from "react";
import api from "@/lib/api";
import { auth } from "@/lib/firebase";
import {
  BookOpen,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  ChevronDown,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Upload,
  X,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { SEMESTERS, BRANCHES } from "@/lib/constants";

interface SemesterSubject {
  _id: string;
  semester: string;
  subject: string;
  subjectCode?: string;
  branch?: string;
  syllabusFileUrl?: string;
  syllabusFileName?: string;
  syllabusStatus?: "processing" | "done" | "failed";
  createdAt?: string;
  updatedAt?: string;
}

const ALL_SEMESTERS = [{ value: "all", label: "All Semesters" }].concat(
  SEMESTERS.map((s) => ({ value: s, label: `Sem ${s}` }))
);

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

function StatusBadge({ status }: { status?: string }) {
  if (!status)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-white/5 text-gray-500 border border-white/10">
        No syllabus
      </span>
    );
  if (status === "done")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
        <CheckCircle className="w-3 h-3" /> Indexed
      </span>
    );
  if (status === "processing")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
        <Clock className="w-3 h-3 animate-spin" /> OCR running
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
      <XCircle className="w-3 h-3" /> Failed
    </span>
  );
}

export default function AdminSemesterSubjectsPage() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<SemesterSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterSemester, setFilterSemester] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // form
  const [formSemester, setFormSemester] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formBranch, setFormBranch] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  const fetchItems = useCallback(async () => {
    if (!mounted) return;
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const params: Record<string, string> = {};
      if (filterSemester !== "all") params.semester = filterSemester;
      const res = await api.get("/semester-subjects", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setItems(res.data.data || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  }, [mounted, filterSemester]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const resetForm = () => {
    setEditingId(null);
    setFormSemester("");
    setFormSubject("");
    setFormCode("");
    setFormBranch("");
    setFormFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (item: SemesterSubject) => {
    setEditingId(item._id);
    setFormSemester(item.semester);
    setFormSubject(item.subject);
    setFormCode(item.subjectCode || "");
    setFormBranch(item.branch || "");
    setFormFile(null);
    if (fileRef.current) fileRef.current.value = "";
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSemester || !formSubject.trim()) {
      toast.error("Semester and subject name are required");
      return;
    }
    setActionLoading("submit");
    try {
      const token = await auth.currentUser?.getIdToken();
      const formData = new FormData();
      formData.append("semester", formSemester);
      formData.append("subject", formSubject.trim());
      if (formCode.trim()) formData.append("subjectCode", formCode.trim());
      if (formBranch.trim()) formData.append("branch", formBranch.trim());
      if (formFile) formData.append("syllabus", formFile);

      if (editingId) {
        await api.put(`/semester-subjects/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Subject updated");
      } else {
        await api.post("/semester-subjects", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success(
          formFile
            ? "Subject created. Syllabus is being OCR'd in the background."
            : "Subject created"
        );
      }
      resetForm();
      setShowForm(false);
      fetchItems();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save subject");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (item: SemesterSubject) => {
    if (
      !confirm(
        `Delete "${item.subject}" (Sem ${item.semester})? This will also remove its syllabus.`
      )
    )
      return;
    setActionLoading(item._id + "-del");
    try {
      const token = await auth.currentUser?.getIdToken();
      await api.delete(`/semester-subjects/${item._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Subject deleted");
      fetchItems();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = search
    ? items.filter(
        (i) =>
          i.subject.toLowerCase().includes(search.toLowerCase()) ||
          (i.subjectCode || "").toLowerCase().includes(search.toLowerCase())
      )
    : items;

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
            <BookOpen
              className="w-5 h-5 text-[#b4afff]"
              strokeWidth={1.75}
            />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Subjects & Syllabi
              </h1>
              <p className="text-xs text-gray-500">
                {items.length} subject{items.length === 1 ? "" : "s"} configured
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search subject or code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#12121a] border border-white/10 rounded-xl pl-8 pr-3 h-9 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5C55F9]/50 w-56"
              />
            </div>
            <FilterSelect
              value={filterSemester}
              onChange={setFilterSemester}
              options={ALL_SEMESTERS}
            />
            <button
              onClick={fetchItems}
              className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 h-9 text-sm text-gray-400 hover:text-white hover:bg-white/8 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 bg-[#5C55F9] hover:bg-[#4d46db] text-white rounded-xl px-3 h-9 text-sm font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New subject
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Form panel */}
        {showForm && (
          <div className="mb-6 bg-[#0c0c14] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white">
                {editingId ? "Edit subject" : "Add new subject"}
              </h3>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="text-gray-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Semester *
                  </label>
                  <FilterSelect
                    value={formSemester}
                    onChange={setFormSemester}
                    options={[
                      { value: "", label: "Select semester" },
                      ...SEMESTERS.map((s) => ({
                        value: s,
                        label: `Sem ${s}`,
                      })),
                    ]}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Subject name *
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Data Structures"
                    className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 h-9 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5C55F9]/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Subject code
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. CS301"
                    className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 h-9 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5C55F9]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Branch (optional)
                  </label>
                  <FilterSelect
                    value={formBranch}
                    onChange={setFormBranch}
                    options={[
                      { value: "", label: "Any branch" },
                      ...BRANCHES.map((b) => ({ value: b, label: b })),
                    ]}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Syllabus PDF{" "}
                    {editingId ? "(replace existing)" : "(optional, OCR runs in background)"}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 bg-[#12121a] border border-white/10 hover:border-[#5C55F9]/40 rounded-xl px-3 h-9 text-sm text-gray-300 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {formFile ? "Change file" : "Choose PDF"}
                    </button>
                    {formFile && (
                      <span className="text-xs text-gray-400 truncate max-w-[260px]">
                        {formFile.name} (
                        {(formFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f && f.type !== "application/pdf") {
                          toast.error("Only PDF files are allowed");
                          return;
                        }
                        if (f && f.size > 15 * 1024 * 1024) {
                          toast.error("Syllabus PDF must be under 15MB");
                          return;
                        }
                        setFormFile(f || null);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="text-sm text-gray-400 hover:text-white px-3 h-9 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "submit"}
                  className="flex items-center gap-2 bg-[#5C55F9] hover:bg-[#4d46db] disabled:opacity-50 text-white rounded-xl px-4 h-9 text-sm font-medium transition-colors"
                >
                  {actionLoading === "submit" && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  {editingId ? "Save changes" : "Create subject"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-7 h-7 text-[#5C55F9] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 text-gray-500">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="mb-1">No subjects found</p>
            <p className="text-xs text-gray-600">
              Click <span className="text-[#b4afff]">New subject</span> to add
              one.
            </p>
          </div>
        ) : (
          <div className="bg-[#0c0c14] border border-white/6 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Sem
                  </th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Code
                  </th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Branch
                  </th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Syllabus
                  </th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {filtered.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#1a1a24] border border-white/8 flex items-center justify-center text-[#b4afff] shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-medium text-white">
                          {item.subject}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-300">
                      Sem {item.semester}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400 hidden md:table-cell">
                      {item.subjectCode || "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400 hidden lg:table-cell">
                      {item.branch || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={item.syllabusStatus} />
                        {item.syllabusFileUrl && (
                          <a
                            href={item.syllabusFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-500 hover:text-[#b4afff] transition-colors"
                            title="View syllabus PDF"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(item)}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === item._id + "-del" ? (
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
        )}
      </div>
    </div>
  );
}
