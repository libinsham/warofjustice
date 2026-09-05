"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlayCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { mediaApi } from "@/lib/api/media";
import { videosApi } from "@/lib/api/videos";

export default function AdminMediaLibraryPage() {
  const [tab, setTab] = useState<"image" | "video" | "document">("image");
  const [search, setSearch] = useState("");

  const { data: images = [], isLoading: loadingImages } = useQuery({
    queryKey: ["admin", "media", "image", search],
    queryFn: () => mediaApi.listAll({ type: "image", search: search || undefined }),
    enabled: tab === "image",
  });

  const { data: videos = [], isLoading: loadingVideos } = useQuery({
    queryKey: ["admin", "videos"],
    queryFn: () => videosApi.listAllAdmin(),
    enabled: tab === "video",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="document">Documents</TabsTrigger>
          </TabsList>
        </Tabs>
        {tab === "image" && (
          <Input placeholder="Search media…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        )}
      </div>

      <Tabs value={tab}>
        <TabsContent value="image">
          {loadingImages ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}
            </div>
          ) : images.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">No images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {images.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative aspect-square bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt={item.alt_text || item.file_name} className="h-full w-full object-cover" />
                  </div>
                  <CardContent className="p-2">
                    <p className="truncate text-xs">{item.file_name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="video">
          {loadingVideos ? (
            <Skeleton className="h-64 w-full" />
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
              <PlayCircle className="h-10 w-10 opacity-40" />
              <p>No videos uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="relative flex aspect-square items-center justify-center bg-muted">
                    {video.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={video.thumbnail_url} alt={video.title} className="h-full w-full object-cover" />
                    ) : (
                      <PlayCircle className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <CardContent className="p-2">
                    <p className="truncate text-xs">{video.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{video.status}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="document">
          <p className="py-16 text-center text-sm text-muted-foreground">
            Document uploads aren&apos;t part of the current Media model&apos;s scope (image/document types exist, but only image upload flow is wired end-to-end).
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
