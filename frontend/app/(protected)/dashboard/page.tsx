"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Material } from "@/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, FileText, Download, Eye } from "lucide-react";
import Link from "next/link";

function MaterialCard({ material }: { material: Material }) {
  const isProcessing = material.status === "processing";

  const handleDownload = async () => {
    if (isProcessing) return;
    try {
      await api.post(`/materials/${material._id}/download`);
      window.open(material.fileUrl, "_blank");
    } catch {
      window.open(material.fileUrl, "_blank");
    }
  };

  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl p-4 transition-all ${isProcessing ? 'opacity-70' : 'hover:border-indigo-800'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <FileText className={`w-8 h-8 shrink-0 mt-0.5 ${isProcessing ? 'text-gray-500' : 'text-indigo-400'}`} />
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{material.year ? `${material.year}` : "Unknown Year"}</h3>
            <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{material.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {isProcessing && <Badge variant="outline" className="text-xs border-amber-800 text-amber-500 bg-amber-950/30">Processing...</Badge>}
              {material.branch && <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">{material.branch}</Badge>}
              {material.semester && <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">Sem {material.semester}</Badge>}
              {!isProcessing && material.subject && <Badge variant="outline" className="text-xs border-indigo-800 text-indigo-400">{material.subject}</Badge>}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        {isProcessing ? (
          <Button size="sm" variant="outline" disabled className="w-full border-gray-700 text-gray-500 text-xs bg-gray-800/50">
            Processing...
          </Button>
        ) : (
          <Link href={`/materials/${material._id}`} className="flex-1">
            <Button size="sm" variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 text-xs">
              <Eye className="w-3 h-3 mr-1" /> View & Chat
            </Button>
          </Link>
        )}
        <Button size="sm" onClick={handleDownload} disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-700 text-xs px-3 disabled:bg-gray-700 disabled:text-gray-500">
          <Download className="w-3 h-3 mr-1" /> Download
        </Button>
      </div>
      {material.downloads !== undefined && !isProcessing && (
        <p className="text-gray-600 text-xs mt-2 flex items-center gap-1">
          <Download className="w-3 h-3" /> {material.downloads} downloads
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: materials, isLoading } = useQuery<Material[]>({
    queryKey: ["materials", debouncedSearch],
    queryFn: async () => {
      const url = debouncedSearch
        ? `/materials/search?query=${encodeURIComponent(debouncedSearch)}`
        : "/materials";
      const res = await api.get(url);
      return res.data.data || res.data;
    },
    refetchInterval: (query) => {
      const ms = query.state.data as Material[] | undefined;
      return ms?.some((m) => m.status === "processing") ? 3000 : false;
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    clearTimeout((window as { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer);
    (window as { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer = setTimeout(() => setDebouncedSearch(e.target.value), 400);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Study Materials</h1>
        <p className="text-gray-400 text-sm mt-1">Browse PYQs, notes, and resources</p>
      </div>

      <div className="relative mb-6 max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
        <Input
          value={search}
          onChange={handleSearch}
          placeholder="Search by title, subject, branch..."
          className="pl-9 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse h-40" />
          ))}
        </div>
      ) : materials?.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No materials found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials?.map((m) => <MaterialCard key={m._id} material={m} />)}
        </div>
      )}
    </div>
  );
}
