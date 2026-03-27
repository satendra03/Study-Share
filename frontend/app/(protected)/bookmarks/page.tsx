"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Material } from "@/types";
import Link from "next/link";
import { Bookmark, ArrowLeft } from "lucide-react";
import { MaterialCard } from "@/components/MaterialCard";
import { WorkspaceGridBackdrop } from "@/components/WorkspaceGridBackdrop";

export default function BookmarksPage() {
  const { data: materials, isLoading } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const res = await api.get("/user/me/bookmarks");
      const raw = res.data.data;
      return Array.isArray(raw) ? (raw as Material[]) : [];
    },
  });

  const list = materials ?? [];

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

        <div className="mb-10">
          <div className="flex items-center gap-2 text-[#5C55F9] mb-2">
            <Bookmark className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-widest">Saved</span>
          </div>
          <h1 className="text-4xl font-medium tracking-tight">Bookmarks</h1>
          <p className="mt-2 text-gray-400 font-light max-w-lg">
            Materials you saved to your profile.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-60 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/2 py-20 text-center">
            <Bookmark className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-300">No bookmarks yet.</p>
            <p className="text-sm text-gray-500 mt-2">Open a document and tap Bookmark to save it here.</p>
            <Link href="/dashboard" className="inline-flex mt-6 text-[#a8a4fc] font-medium hover:text-white">
              Browse library →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((m, i) => (
              <MaterialCard key={m._id} material={m} featured={i === 0 && list.length > 2} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
