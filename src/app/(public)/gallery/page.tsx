import { GalleryGrid } from "./gallery-grid";
import { galleryApi } from "@/lib/api/gallery";

export const metadata = { title: "Photo Gallery" };

export default async function GalleryPage() {
  const feed = await galleryApi.listPublished().catch(() => ({ results: [], count: 0, next: null, previous: null }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-black uppercase tracking-wide">Photo Gallery</h1>
      {feed.results.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No photos published yet.</p>
      ) : (
        <GalleryGrid posts={feed.results} />
      )}
    </div>
  );
}
