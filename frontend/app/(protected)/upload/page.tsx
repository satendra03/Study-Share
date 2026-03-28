"use client";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { Upload, FileText, CheckCircle, Loader, X, FileUp, ArrowLeft, DownloadCloudIcon, ChevronDown } from "lucide-react";
import { WorkspaceGridBackdrop } from "@/components/WorkspaceGridBackdrop";
import Link from "next/link";
import { BRANCHES, SEMESTERS, YEARS, FILE_TYPES } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

type Status = "idle" | "uploading" | "processing" | "done" | "failed";

/** Reusable form dropdown matching the dashboard style */
function FormDropdown({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select",
  required = false,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const preventCloseRef = useRef(false);

  const displayText = value
    ? options.find((o) => o.value === value)?.label || value
    : placeholder;

  return (
    <div>
      <Label className="text-gray-300 font-medium mb-2 block">{label}{required ? " *" : ""}</Label>
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
        <DropdownMenuTrigger className="inline-flex items-center justify-between w-full cursor-pointer bg-[#12121a] border border-white/10 rounded-xl px-3 h-11 text-sm hover:bg-[#16162a] transition-colors focus:outline-none focus:border-[#5C55F9]/50 focus:ring-1 focus:ring-[#5C55F9]/50 select-none">
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

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [form, setForm] = useState({ year: "", description: "", subject: "", subjectCode: "", branch: "", semester: "", fileType: "Other" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select a file to upload."); return; }

    // Validate dropdown fields (not covered by native 'required')
    if (!form.branch || !form.semester || !form.year) {
      setError("Please select branch, semester, and year.");
      return;
    }

    setError("");
    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);
    Object.entries(form).forEach(([k, v]) => v && formData.append(k, v));

    try {
      await api.post("/materials", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("done");
    } catch (err: unknown) {
      setStatus("failed");
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  const reset = () => {
    setFile(null); setStatus("idle"); setError("");
    setForm({ year: "", description: "", subject: "", subjectCode: "", branch: "", semester: "", fileType: "Other" });
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    } else {
      setError("Please drop a valid PDF file.");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#030303] text-white antialiased">
      <WorkspaceGridBackdrop />

      <div className="relative z-10 px-6 md:px-10 pt-10 pb-16">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to library
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-[#5C55F9] mb-2">
              <DownloadCloudIcon className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-widest">Contribute</span>
            </div>
            <h1 className="text-4xl font-medium tracking-tight">Upload Material</h1>
            <p className="mt-2 text-gray-400 font-light max-w-lg">
              Share your knowledge with the community.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          {status === "done" ? (
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-linear-to-br from-[#12121a] to-[#0a0a10] p-5 text-center shadow-[0_0_0_1px_rgba(92,85,249,0.08)] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(92,85,249,0.15),transparent_70%)] pointer-events-none" />
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-3">Upload Successful!</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Your material is being indexed and processed. It will be live on your dashboard and available for everyone soon.
                </p>
                <button
                  onClick={reset}
                  className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Another File
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-xl p-6 md:p-7 rounded-3xl border border-white/10 bg-[#0c0c10]/80 backdrop-blur-md shadow-2xl">
              {error && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
                  <X className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label className="text-gray-300 font-medium mb-3 block">Document File</Label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                    border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
                    ${isDragging ? "border-[#5C55F9] bg-[#5C55F9]/5" : "border-white/10 hover:border-[#5C55F9]/50 hover:bg-white/5"}
                    ${file ? "bg-[#5C55F9]/5 border-[#5C55F9]/30" : ""}
                  `}
                  >
                    {file ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#5C55F9]/10 flex items-center justify-center mb-4">
                          <FileText className="text-[#5C55F9] w-8 h-8" />
                        </div>
                        <span className="text-white font-medium text-lg mb-1">{file.name}</span>
                        <span className="text-gray-500 text-sm mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setFile(null); }}
                          className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded-full transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                          <FileUp className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                        </div>
                        <p className="text-gray-200 font-medium mb-1">Click to browse or drag and drop</p>
                        <p className="text-gray-500 text-sm">PDF files only (Max 15MB)</p>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                      onChange={e => {
                        const selected = e.target.files?.[0];
                        if (selected) {
                          if (selected.type !== "application/pdf") {
                            setError("Please select a PDF file.");
                          } else {
                            setError("");
                            setFile(selected);
                          }
                        }
                      }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="md:col-span-2">
                    <Label className="text-gray-300 font-medium mb-2 block">Description</Label>
                    <Textarea
                      className="bg-[#12121a] border-white/10 text-white focus:border-[#5C55F9]/50 focus:ring-1 focus:ring-[#5C55F9]/50 resize-none rounded-xl"
                      rows={2}
                      placeholder="Brief description of the material, topics covered, etc."
                      value={form.description}
                      onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center gap-4 my-2">
                      <div className="h-px bg-white/10 flex-1"></div>
                      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Details</span>
                      <div className="h-px bg-white/10 flex-1"></div>
                    </div>
                  </div>

                  <div id="branch">
                    <FormDropdown
                      label="Branch"
                      value={form.branch}
                      onValueChange={(v) => setForm(p => ({ ...p, branch: v }))}
                      options={BRANCHES.map(b => ({ value: b, label: b }))}
                      placeholder="Select branch"
                      required
                    />
                  </div>

                  <div id="semester">
                    <FormDropdown
                      label="Semester"
                      value={form.semester}
                      onValueChange={(v) => setForm(p => ({ ...p, semester: v }))}
                      options={SEMESTERS.map(s => ({ value: s, label: `Sem ${s}` }))}
                      placeholder="Select semester"
                      required
                    />
                  </div>

                  <div id="subject">
                    <Label className="text-gray-300 font-medium mb-2 block">Subject *</Label>
                    <Input
                      className="bg-[#12121a] border-white/10 text-white focus:border-[#5C55F9]/50 focus:ring-1 focus:ring-[#5C55F9]/50 rounded-xl h-11"
                      placeholder="e.g. Data Structures"
                      value={form.subject}
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      required
                    />
                  </div>

                  <div id="year">
                    <FormDropdown
                      label="Year"
                      value={form.year}
                      onValueChange={(v) => setForm(p => ({ ...p, year: v }))}
                      options={YEARS.map(y => ({ value: y, label: y }))}
                      placeholder="Select year"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div id="fileType">
                        <FormDropdown
                          label="File Type"
                          value={form.fileType}
                          onValueChange={(v) => setForm(p => ({ ...p, fileType: v }))}
                          options={FILE_TYPES.map(ft => ({ value: ft.value, label: ft.label }))}
                          placeholder="Select type"
                          required
                        />
                      </div>
                      <div id="subjectCode">
                        <Label className="text-gray-300 font-medium mb-2 block">Subject Code</Label>
                        <Input
                          className="bg-[#12121a] border-white/10 text-white focus:border-[#5C55F9]/50 focus:ring-1 focus:ring-[#5C55F9]/50 rounded-xl h-11"
                          placeholder="e.g. CS301"
                          value={form.subjectCode}
                          onChange={e => setForm(p => ({ ...p, subjectCode: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={status === "uploading"}
                    className="w-full relative group overflow-hidden rounded-xl bg-[#5C55F9] text-white p-px font-medium"
                  >
                    <span className="absolute inset-0 bg-linear-to-r from-[#5C55F9] to-[#7f78fa] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative bg-[#5C55F9] py-2.5 px-6 rounded-xl transition-all duration-300 group-hover:bg-opacity-0 flex items-center justify-center gap-2">
                      {status === "uploading" ? (
                        <><Loader className="w-5 h-5 animate-spin" /> Processing Upload...</>
                      ) : (
                        <><Upload className="w-5 h-5" /> Submit Material</>
                      )}
                    </div>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
