"use client";

import React from "react";
import Link from "next/link";
import { Download, CheckCircle, FileText } from "lucide-react";
import { Material } from "@/types";
import { formatFileSize } from "@/lib/utils";
import api from "@/lib/api";

function extFromMaterial(m: Material): string {
  const fromUrl = m.fileUrl?.split(".").pop();
  if (fromUrl && fromUrl.length <= 5) return fromUrl.toUpperCase();
  if (m.fileType?.includes("pdf")) return "PDF";
  return "FILE";
}

function formatUploaded(m: Material): string {
  if (m.createdAt) {
    try {
      return new Date(m.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" });
    } catch {
      /* fall through */
    }
  }
  if (m.year) return String(m.year);
  return "Recently";
}

export function MaterialCard({
  material,
  featured = false,
}: {
  material: Material;
  featured?: boolean;
}) {
  const isProcessing = material.status === "processing";
  const ext = extFromMaterial(material);
  const title = material.title || material.fileName || "Untitled document";
  const downloads = material.downloads ?? 0;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isProcessing || !material._id) return;
    try {
      await api.post(`/materials/${material._id}/download`);
      if (material.fileUrl) window.open(material.fileUrl, "_blank");
    } catch {
      if (material.fileUrl) window.open(material.fileUrl, "_blank");
    }
  };

  if (featured) {
    return (
      <Link
        href={`/materials/${material._id}`}
        className="block lg:col-span-2 group relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-[#12121a] to-[#0a0a10] shadow-[0_0_0_1px_rgba(92,85,249,0.08)] transition-all hover:border-[#5C55F9]/40 hover:shadow-[0_20px_60px_-24px_rgba(92,85,249,0.35)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(92,85,249,0.12),transparent_55%)] pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row min-h-[200px]">
          <div className="sm:w-[38%] p-6 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-white/10 bg-black/20">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl border border-[#5C55F9]/25 bg-[#5C55F9]/5" />
              <FileText className="w-12 h-12 text-[#5C55F9]/90 relative z-10" strokeWidth={1.25} />
            </div>
            <span className="mt-4 text-[10px] font-medium uppercase tracking-widest text-gray-500">{ext}</span>
          </div>

          <div className="flex-1 p-6 flex flex-col justify-center">
            <div className="flex justify-between items-start gap-3 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#5C55F9]/90">Featured</span>
              {!isProcessing && <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400/90" />}
              {isProcessing && (
                <span className="text-[10px] uppercase tracking-wider text-amber-400/90">Processing</span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-white leading-snug pr-2 mb-3">{title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-5">
              {material.description || "Open to read notes, chat with the document, or download."}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {material.branch && (
                <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium rounded-full border border-white/10 bg-white/5 text-gray-200">
                  {material.branch}
                </span>
              )}
              {material.semester && (
                <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium rounded-full border border-white/10 bg-white/5 text-gray-200">
                  Sem {material.semester}
                </span>
              )}
              {material.year && (
                <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium rounded-full border border-[#5C55F9]/25 text-[#a8a4fc]">
                  {material.year}
                </span>
              )}
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-4 relative z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void handleDownload(e);
                }}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 rounded-full bg-white text-[#030303] px-5 py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                Download ({formatFileSize(material.fileSize)})
              </button>
              <span className="text-sm font-medium text-[#a8a4fc]">Open from card →</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/materials/${material._id}`}
      className="group flex flex-col rounded-2xl border border-white/10 bg-[#0c0c10]/90 p-5 min-h-[240px] transition-all hover:border-[#5C55F9]/35 hover:bg-[#12121a]/95"
    >
      <div className="flex justify-between items-start gap-2 mb-4">
        <span className="text-[10px] font-mono text-gray-500 tracking-wide truncate max-w-[60%]">
          {material._id ? `…${material._id.slice(-6)}` : "—"}
        </span>
        <span className="text-[10px] font-semibold text-[#5C55F9]/90 shrink-0">.{ext}</span>
      </div>

      <h3 className="text-lg font-medium tracking-tight text-white leading-snug line-clamp-3 mb-1 flex-1">{title}</h3>

      <div className="flex flex-wrap gap-2 mt-auto pt-4 mb-4">
        {material.branch ? (
          <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium rounded-full border border-white/10 bg-white/5 text-gray-300">
            {material.branch}
          </span>
        ) : (
          <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium rounded-full border border-white/10 bg-white/5 text-gray-400">
            General
          </span>
        )}
        {material.semester && (
          <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium rounded-full border border-white/10 bg-white/5 text-gray-300">
            Sem {material.semester}
          </span>
        )}
        {isProcessing && (
          <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium rounded-full border border-amber-500/30 text-amber-400/90">
            Processing
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-3 border-t border-white/5">
        <span className="flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5 opacity-70" />
          {downloads.toLocaleString()} downloads
        </span>
        <span>{formatUploaded(material)}</span>
      </div>
    </Link>
  );
}
