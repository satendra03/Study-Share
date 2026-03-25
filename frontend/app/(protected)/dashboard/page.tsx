"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Material } from "@/types";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { MaterialCard } from "@/components/MaterialCard";
import { WorkspaceGridBackdrop } from "@/components/WorkspaceGridBackdrop";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: materials, isLoading } = useQuery<Material[]>({
    queryKey: ["materials", debouncedSearch],
    queryFn: async () => {
      const url = debouncedSearch
        ? `/materials/search?q=${encodeURIComponent(debouncedSearch)}`
        : "/materials";
      const res = await api.get(url);
      const raw = res.data.data;
      return Array.isArray(raw) ? raw : [];
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const w = window as unknown as { _searchTimer?: ReturnType<typeof setTimeout> };
    clearTimeout(w._searchTimer);
    w._searchTimer = setTimeout(() => setDebouncedSearch(e.target.value), 400);
  };

  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    const w = window as unknown as { _searchTimer?: ReturnType<typeof setTimeout> };
    clearTimeout(w._searchTimer);
  };

  const count = materials?.length ?? 0;

  return (
    <div className="relative flex min-h-full flex-col w-full bg-[#030303] text-white antialiased">
      <WorkspaceGridBackdrop className="max-h-[min(58vh,560px)] min-h-[400px]" />

      <div className="relative z-10 flex flex-col flex-1 px-6 md:px-10 pt-10 pb-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#5C55F9]/90 mb-3">Library</p>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white leading-[1.1]">
              Study materials
            </h1>
            <p className="mt-3 text-lg text-gray-400 font-light max-w-xl leading-relaxed">
              Browse PDFs shared by the community—same look and feel as the marketing site, powered by live search.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Showing</p>
              <p className="text-sm font-medium text-white tabular-nums">{isLoading ? "…" : count} items</p>
            </div>
          </div>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          </div>
          <input
            type="search"
            value={search}
            onChange={handleSearch}
            className={`block w-full pl-12 py-4 rounded-2xl border border-white/10 bg-black/40 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5C55F9]/35 focus:border-[#5C55F9]/40 transition-all text-base backdrop-blur-md ${search ? "pr-12" : "pr-4"}`}
            placeholder="Search by title, topic, filename…"
            autoComplete="off"
          />
          {search ? (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-gray-500 hover:text-white cursor-pointer transition-colors"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-10 text-sm text-gray-500">
          <SlidersHorizontal className="w-4 h-4 opacity-70" />
          <span>Filters coming soon — use search for now.</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[280px] rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
            <div className="h-[260px] rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
          </div>
        ) : materials?.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-dashed border-white/15 bg-white/2">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-40 text-[#5C55F9]" />
            <p className="text-lg text-gray-200 font-medium">No materials yet</p>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Try another search or upload the first document for your batch.
            </p>
            <Link
              href="/upload"
              className="inline-flex mt-8 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-[#030303] hover:bg-gray-100"
            >
              Upload material
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials?.map((m, index) => (
              <MaterialCard key={m._id} material={m} featured={index === 0} />
            ))}
          </div>
        )}

        <footer className="mt-auto pt-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500 border-t border-white/10">
          <p>StudyShare — built for focused learning.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/docs/api" className="hover:text-[#a8a4fc] transition-colors">
              API docs
            </Link>
            <Link href="/" className="hover:text-[#a8a4fc] transition-colors">
              Home
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
