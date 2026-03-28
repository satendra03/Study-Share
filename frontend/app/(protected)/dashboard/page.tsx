"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Material } from "@/types";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { MaterialCard } from "@/components/MaterialCard";
import { WorkspaceGridBackdrop } from "@/components/WorkspaceGridBackdrop";
import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { BRANCHES, SEMESTERS, YEARS, semesterOptions, branchOptions, yearOptions } from "@/lib/constants";

// Reusable filter dropdown component
// Uses controlled open state so menu stays open after selecting an option.
// Closes only on click-outside or Escape.
function FilterDropdown({
  label,
  value,
  onValueChange,
  options,
  allLabel = "All",
  showAll = true,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
  allLabel?: string;
  showAll?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const preventCloseRef = useRef(false);

  const displayText = value
    ? options.find((o) => o.value === value)?.label || value
    : allLabel;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && preventCloseRef.current) {
          preventCloseRef.current = false;
          return; // Block the close triggered by item click
        }
        setOpen(nextOpen);
      }}
    >
      <DropdownMenuTrigger className="inline-flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[#5C55F9] select-none">
        <span className="text-gray-400 text-xs mr-0.5">{label}:</span>
        <span className="text-white font-medium">{displayText}</span>
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
          {showAll && (
            <DropdownMenuRadioItem value="" className="text-gray-300 cursor-pointer focus:bg-[#5C55F9]/10 focus:text-white">
              {allLabel}
            </DropdownMenuRadioItem>
          )}
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
  );
}

export default function DashboardPage() {
  const { appUser } = useAuthStore();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [filters, setFilters] = useState({
    branch: "",
    semester: "",
    year: "",
    subject: ""
  });

  // Hydrate filters from user profile on mount
  useEffect(() => {
    if (appUser?.studentProfile) {
      setFilters(prev => ({
        ...prev,
        branch: appUser.studentProfile?.branch || BRANCHES[0],
        semester: appUser.studentProfile?.semester?.toString() || ""
      }));
    } else {
      // No profile — still default to first branch since "All" isn't available
      setFilters(prev => ({ ...prev, branch: prev.branch || BRANCHES[0] }));
    }
  }, [appUser]);

  const { data: materials, isLoading } = useQuery<Material[]>({
    queryKey: ["materials", debouncedSearch, filters],
    queryFn: async () => {
      let url = "";
      const params = new URLSearchParams();

      if (debouncedSearch) {
        url = "/materials/search";
        params.append("q", debouncedSearch);
      } else {
        url = "/materials";
      }

      if (filters.branch) params.append("branch", filters.branch);
      if (filters.semester) params.append("semester", filters.semester);
      if (filters.year) params.append("year", filters.year);
      if (filters.subject) params.append("subject", filters.subject);

      const res = await api.get(`${url}?${params.toString()}`);
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

  const count = materials?.length ?? 0;

  const resetFilters = () => {
    setFilters({
      branch: appUser?.studentProfile?.branch || "",
      semester: appUser?.studentProfile?.semester?.toString() || "",
      year: "",
      subject: ""
    });
  };

  return (
    <div className="relative flex flex-col justify-between w-full bg-[#030303] text-white antialiased">
      <WorkspaceGridBackdrop className="max-h-[min(58vh,560px)] min-h-[400px]" />

      <div className="relative z-10 flex flex-col flex-1 px-6 md:px-10 pt-10 pb-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#5C55F9]/90 mb-3">Library</p>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white leading-[1.1]">
              Study materials
            </h1>
            <p className="mt-3 text-lg text-gray-400 font-light max-w-xl leading-relaxed">
              Browse PDFs shared by the community—filtered for your branch and semester by default.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-right backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Showing</p>
              <p className="text-sm font-medium text-white tabular-nums">{isLoading ? "…" : count} items</p>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <input
            type="search"
            value={search}
            onChange={handleSearch}
            className={`block w-full pl-12 py-4 rounded-2xl border border-white/10 bg-black/40 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5C55F9]/35 focus:border-[#5C55F9]/40 transition-all text-base backdrop-blur-md ${search ? "pr-12" : "pr-4"}`}
            placeholder="Search by title, topic, filename…"
            autoComplete="off"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             <Search className="w-5 h-5 text-gray-500" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <div className="flex items-center gap-2 text-sm text-gray-400 mr-1">
            <SlidersHorizontal className="w-4 h-4 opacity-70" />
            <span>Refine:</span>
          </div>

          <FilterDropdown
            label="Branch"
            value={filters.branch}
            onValueChange={(v) => setFilters((f) => ({ ...f, branch: v }))}
            options={branchOptions}
            allLabel="All Branches"
          />

          <FilterDropdown
            label="Semester"
            value={filters.semester}
            onValueChange={(v) => setFilters((f) => ({ ...f, semester: v }))}
            options={semesterOptions}
            allLabel="All Semesters"
          />

          <FilterDropdown
            label="Year"
            value={filters.year}
            onValueChange={(v) => setFilters((f) => ({ ...f, year: v }))}
            options={yearOptions}
            allLabel="All Years"
          />

          <input
            type="text"
            placeholder="Subject..."
            value={filters.subject}
            onChange={e => setFilters(f => ({ ...f, subject: e.target.value }))}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5C55F9] placeholder:text-gray-600 w-32 md:w-40"
          />

          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 hover:text-white transition-colors ml-auto"
          >
            <X className="w-3 h-3" />
            Reset
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[280px] rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : materials?.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-dashed border-white/15 bg-white/2">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-40 text-[#5C55F9]" />
            <p className="text-lg text-gray-200 font-medium">No materials yet</p>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Try adjusting your filters or search terms.
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
            {materials?.map((material, index) => (
              <MaterialCard key={material._id} material={material} featured={index === 0 && !debouncedSearch && !filters.branch} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
