"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { Upload, FileText, CheckCircle, Loader, X } from "lucide-react";

type Status = "idle" | "uploading" | "processing" | "done" | "failed";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ title: "", description: "", subject: "", subjectCode: "", branch: "", semester: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select a file"); return; }
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
      setError(error.response?.data?.message || "Upload failed");
    }
  };

  const reset = () => {
    setFile(null); setStatus("idle"); setError("");
    setForm({ title: "", description: "", subject: "", subjectCode: "", branch: "", semester: "" });
    if (fileRef.current) fileRef.current.value = "";
  };

  if (status === "done") return (
    <div className="max-w-lg mx-auto text-center py-20">
      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Upload Initiated!</h2>
      <p className="text-gray-400 mb-6">Your material is being processed in the background and will be available shortly on your dashboard.</p>
      <Button onClick={reset} className="bg-indigo-600 hover:bg-indigo-700">Upload Another</Button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Upload Material</h1>
        <p className="text-gray-400 text-sm mt-1">Share notes, PYQs, or any study resource</p>
      </div>

      {error && <p className="text-red-400 text-sm mb-4 bg-red-950 px-3 py-2 rounded">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        {/* File Drop Zone */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-700 hover:border-indigo-600 rounded-xl p-8 text-center cursor-pointer transition-colors"
        >
          {file ? (
            <div className="flex items-center justify-center gap-2">
              <FileText className="text-indigo-400 w-6 h-6" />
              <span className="text-white text-sm">{file.name}</span>
              <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}>
                <X className="w-4 h-4 text-gray-500 hover:text-red-400" />
              </button>
            </div>
          ) : (
            <div>
              <Upload className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Click to select a PDF file</p>
              <p className="text-gray-600 text-xs mt-1">Max 5MB</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept=".pdf" className="hidden"
            onChange={e => setFile(e.target.files?.[0] || null)} />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label className="text-gray-300">Title *</Label>
            <Input className="bg-gray-800 border-gray-700 text-white mt-1" placeholder="e.g. Data Structures PYQ 2023"
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div>
            <Label className="text-gray-300">Description</Label>
            <Textarea className="bg-gray-800 border-gray-700 text-white mt-1 resize-none" rows={2}
              placeholder="Brief description of the material"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Branch</Label>
              <Input className="bg-gray-800 border-gray-700 text-white mt-1" placeholder="e.g. CSE"
                value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))} />
            </div>
            <div>
              <Label className="text-gray-300">Semester</Label>
              <Input className="bg-gray-800 border-gray-700 text-white mt-1" placeholder="e.g. 4"
                value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Subject</Label>
              <Input className="bg-gray-800 border-gray-700 text-white mt-1" placeholder="e.g. Data Structures"
                value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
            </div>
            <div>
              <Label className="text-gray-300">Subject Code</Label>
              <Input className="bg-gray-800 border-gray-700 text-white mt-1" placeholder="e.g. CS301"
                value={form.subjectCode} onChange={e => setForm(p => ({ ...p, subjectCode: e.target.value }))} />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={status === "uploading"} className="w-full bg-indigo-600 hover:bg-indigo-700">
          {status === "uploading" ? (
            <><Loader className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="w-4 h-4 mr-2" /> Upload Material</>
          )}
        </Button>
      </form>
    </div>
  );
}
