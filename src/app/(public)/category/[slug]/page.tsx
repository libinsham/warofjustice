import type { Metadata } from "next";

import { NewsCard } from "@/components/public/news-card";
import { postsApi } from "@/lib/api/posts";
import { categoriesApi } from "@/lib/api/categories";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug.charAt(0).toUpperCase()}${slug.slice(1)} News` };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;
  const pageNum = Number(page) || 1;

  const [feed, categories] = await Promise.all([
    postsApi.listPublished({ category: slug, page: pageNum }),
    categoriesApi.list(),
  ]);

  const category = categories.find((c) => c.slug === slug);

  return (
    <div>
      <div className="border-b bg-neutral-950 py-10 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Category</p>
          <h1 className="mt-1 text-3xl font-black">{category?.name ?? slug}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {feed.results.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No stories in this category yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {feed.results.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {feed.next && (
          <div className="mt-10 text-center">
            <a
              href={`?page=${pageNum + 1}`}
              className="inline-block rounded-md border px-6 py-2 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              Load More
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
