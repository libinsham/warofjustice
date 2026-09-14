import { NewsCard } from "@/components/public/news-card";
import { postsApi } from "@/lib/api/posts";

export const metadata = { title: "Latest News" };

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function LatestNewsPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const pageNum = Number(page) || 1;

  const feed = await postsApi
    .listPublished({ page: pageNum })
    .catch(() => ({ results: [], count: 0, next: null, previous: null }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-black uppercase tracking-wide">Latest News</h1>

      {feed.results.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No stories published yet.</p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {feed.results.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            {pageNum > 1 && (
              <a
                href={`/latest?page=${pageNum - 1}`}
                className="rounded-md border px-6 py-2 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                ← Previous
              </a>
            )}
            {feed.next && (
              <a
                href={`/latest?page=${pageNum + 1}`}
                className="rounded-md border px-6 py-2 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                Next →
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}
