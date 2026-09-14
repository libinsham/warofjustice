import { Search } from "lucide-react";

import { NewsCard } from "@/components/public/news-card";
import { Input } from "@/components/ui/input";
import { postsApi } from "@/lib/api/posts";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props) {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : "Search" };
}

export default async function SearchResultsPage({ searchParams }: Props) {
  const { q, page } = await searchParams;
  const query = q?.trim() ?? "";
  const pageNum = Number(page) || 1;

  const feed = query
    ? await postsApi.listPublished({ search: query, page: pageNum }).catch(() => ({ results: [], count: 0, next: null, previous: null }))
    : { results: [], count: 0, next: null, previous: null };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <form action="/search" className="mb-8">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={query} placeholder="Search articles, categories, tags…" className="pl-10" />
        </div>
      </form>

      {!query ? (
        <p className="text-center text-muted-foreground">Enter a search term above.</p>
      ) : (
        <>
          <p className="mb-6 text-sm text-muted-foreground">
            {feed.count} result{feed.count === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
          </p>
          {feed.results.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">No matching stories found.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {feed.results.map((post) => (
                <NewsCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
