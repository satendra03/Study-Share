"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Material } from "@/types";
import Link from "next/link";
import { FileUp, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { MaterialCard } from "@/components/MaterialCard";
import { WorkspaceGridBackdrop } from "@/components/WorkspaceGridBackdrop";

export default function MyUploadsPage() {
  const { appUser } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["my-uploads", appUser?.firebaseUid],
    enabled: Boolean(appUser?.firebaseUid),
    queryFn: async () => {
      const res = await api.get(`/materials/user/${appUser!.firebaseUid}`, {
        params: { page: 1, limit: 100 },
      });
      const payload = res.data.data as { materials: Material[]; total?: number } | Material[];
      if (Array.isArray(payload)) return payload;
      return payload.materials ?? [];
    },
  });

  const materials = data ?? [];

  return (
    <div className="relative flex flex-col justify-between bg-[#030303] text-white antialiased">
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
              <FileUp className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-widest">Your uploads</span>
            </div>
            <h1 className="text-4xl font-medium tracking-tight">My uploads</h1>
            <p className="mt-2 text-gray-400 font-light max-w-lg">
              Everything you have added.
            </p>
          </div>
          <Link
            href="/upload"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-[#4d46db] transition-colors shrink-0"
          >
            New upload
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[240px] rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : materials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/2 py-20 text-center">
            <FileUp className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-300">You have not uploaded any materials yet.</p>
            <Link href="/upload" className="inline-flex mt-6 text-[#a8a4fc] font-medium hover:text-white">
              Upload your first PDF →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((m, i) => (
              <MaterialCard key={m._id} material={m} featured={i === 0 && materials.length > 2} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
