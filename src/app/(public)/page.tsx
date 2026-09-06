import Link from "next/link";

import { BreakingTicker } from "@/components/public/breaking-ticker";
import { InaugurationPopup } from "@/components/public/inauguration-popup";
import { NewsCard } from "@/components/public/news-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postsApi } from "@/lib/api/posts";
import { categoriesApi } from "@/lib/api/categories";
import type { PostSummary } from "@/types";

// Server Component — fetched at request time so published content is
// always current; swap to `revalidate` if you want ISR caching instead.
export default async function HomePage() {
  const [feedRes, breakingRes, trendingRes, categories] =
    await Promise.all([
      postsApi.listPublished({ page: 1 }).catch(() => ({
        results: [] as PostSummary[],
        count: 0,
        next: null,
        previous: null,
      })),

      postsApi.listPublished({ breaking: true }).catch(() => ({
        results: [] as PostSummary[],
        count: 0,
        next: null,
        previous: null,
      })),

      postsApi.listPublished({ trending: true }).catch(() => ({
        results: [] as PostSummary[],
        count: 0,
        next: null,
        previous: null,
      })),

      categoriesApi.list().catch(() => []),
    ]);

  const feed = feedRes.results;
  const hero = feed[0];
  const topStories = feed.slice(1, 5);
  const latest = feed.slice(5, 11);
  const trending = trendingRes.results.slice(0, 5);

  return (
    <>
      {/* ========================================= */}
      {/* INAUGURATION POPUP                       */}
      {/* ========================================= */}
      <InaugurationPopup />

      {/* ========================================= */}
      {/* MAIN WAR OF JUSTICE HOMEPAGE             */}
      {/* ========================================= */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <BreakingTicker posts={breakingRes.results} />

        {/* Hero + Top Stories */}
        {hero && (
          <section className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Link
                href={`/article/${hero.slug}`}
                className="group block"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
                  {hero.featured_image_url && (
                    <img
                      src={hero.featured_image_url}
                      alt={hero.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="eager"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold uppercase text-primary-foreground">
                      {hero.category?.name}
                    </span>

                    <h1 className="mt-2 text-2xl font-black leading-tight text-white md:text-3xl">
                      {hero.title}
                    </h1>

                    <p className="mt-2 line-clamp-2 text-sm text-white/80">
                      {hero.short_description}
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            <aside>
              <h2 className="mb-3 border-b-2 border-primary pb-2 text-sm font-black uppercase tracking-wide">
                Top Stories
              </h2>

              <div className="space-y-4">
                {topStories.map((post) => (
                  <NewsCard
                    key={post.id}
                    post={post}
                    variant="horizontal"
                  />
                ))}
              </div>
            </aside>
          </section>
        )}

        {/* Latest News */}
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-wide">
              Latest News
            </h2>

            <Link
              href="/latest"
              className="text-sm font-semibold text-primary hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        {/* Explore Categories */}
        {categories.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-lg font-black uppercase tracking-wide">
              Explore Categories
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="rounded-lg border p-4 text-center text-sm font-semibold transition hover:border-primary hover:text-primary"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trending Now */}
        {trending.length > 0 && (
          <section className="mt-12 rounded-xl bg-muted/40 p-6">
            <h2 className="mb-4 text-lg font-black uppercase tracking-wide">
              Trending Now
            </h2>

            <ol className="space-y-4">
              {trending.map((post, i) => (
                <li key={post.id} className="flex gap-4">
                  <span className="text-2xl font-black text-primary/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <Link
                    href={`/article/${post.slug}`}
                    className="text-sm font-semibold hover:text-primary"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Newsletter */}
        <section className="mt-12 rounded-xl bg-neutral-950 p-8 text-white">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black">
                Stay Informed. Stay Ahead.
              </h2>

              <p className="mt-1 text-sm text-neutral-400">
                Get the top stories of the day delivered to your inbox.
              </p>
            </div>

            <form className="flex w-full gap-2 md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="bg-white text-black md:w-64"
              />

              <Button type="submit">
                Subscribe
              </Button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}