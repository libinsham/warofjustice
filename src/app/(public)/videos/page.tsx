import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";

import { videosApi } from "@/lib/api/videos";

export const metadata = { title: "Videos" };

export default async function VideosPage() {
  const feed = await videosApi.listPublished().catch(() => ({ results: [], count: 0, next: null, previous: null }));
  const [featured, ...rest] = feed.results;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-black uppercase tracking-wide">Videos</h1>

      {feed.results.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No videos published yet.</p>
      ) : (
        <>
          {featured && (
            <Link href={`/videos/${featured.slug}`} className="group mb-10 block">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                <Image
                  src={featured.video.thumbnail_url || featured.featured_image_url}
                  alt={featured.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
                  <PlayCircle className="h-16 w-16 text-white/90" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h2 className="text-xl font-black text-white md:text-2xl">{featured.title}</h2>
                </div>
              </div>
            </Link>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((item) => (
              <Link key={item.id} href={`/videos/${item.slug}`} className="group block">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={item.video.thumbnail_url || item.featured_image_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, 100vw"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition group-hover:bg-black/20">
                    <PlayCircle className="h-10 w-10 text-white/90" />
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-bold group-hover:text-primary">{item.title}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
