"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, Trash2, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { mediaApi } from "@/lib/api/media";
import type { Media } from "@/types";

export default function AuthorMediaLibraryPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: media = [], isLoading } = useQuery({
    queryKey: ["dashboard", "media"],
    queryFn: () => mediaApi.listMine(),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.uploadImage(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard", "media"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => mediaApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard", "media"] }),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyUrl = (item: Media) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filtered = media.filter((m) => m.file_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search media…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
            <Upload className="h-4 w-4" />
            {uploadMutation.isPending ? "Uploading…" : "Upload Image"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No media yet. Upload your first image above.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-square bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.alt_text || item.file_name} className="h-full w-full object-cover" />
              </div>
              <CardContent className="space-y-2 p-3">
                <p className="truncate text-xs font-medium">{item.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.size_bytes ? `${(item.size_bytes / 1024).toFixed(0)} KB` : ""}
                </p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => copyUrl(item)}>
                    {copiedId === item.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => deleteMutation.mutate(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
