import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import type { Metadata } from "next";

import { VideoPlayer } from "@/components/public/video-player";
import { Badge } from "@/components/ui/badge";
import { videosApi } from "@/lib/api/videos";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const item = await videosApi.getBySlug(slug);
    return { title: item.title, description: item.short_description };
  } catch {
    return { title: "Video not found" };
  }
}

export default async function VideoDetailsPage({ params }: Props) {
  const { slug } = await params;

  let item;
  try {
    item = await videosApi.getBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link href="/videos" className="hover:text-primary">Videos</Link>
      </nav>

      {item.video.status === "ready" && item.video.playback_url ? (
        <VideoPlayer playbackUrl={item.video.playback_url} posterUrl={item.video.thumbnail_url} />
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
          This video is still processing — check back shortly.
        </div>
      )}

      <div className="mt-6">
        <Badge>{item.category.name}</Badge>
        <h1 className="mt-3 text-2xl font-black leading-tight md:text-3xl">{item.title}</h1>
        {item.short_description && <p className="mt-2 text-muted-foreground">{item.short_description}</p>}

        <div className="mt-4 flex items-center gap-3 border-b pb-4 text-sm">
          <span className="font-semibold">{item.author.username}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {item.published_at ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true }) : ""}
          </span>
          {item.video.duration_seconds && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {Math.floor(item.video.duration_seconds / 60)}:{String(item.video.duration_seconds % 60).padStart(2, "0")}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
