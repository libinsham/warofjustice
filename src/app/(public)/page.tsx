import Link from "next/link";

import { InaugurationPopup } from "@/components/public/inauguration-popup";
import { NewsCard } from "@/components/public/news-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postsApi } from "@/lib/api/posts";
import { categoriesApi } from "@/lib/api/categories";
import type { PostSummary } from "@/types";

/*
 * Always fetch fresh homepage data.
 *
 * This prevents the homepage from serving an older cached version
 * after posts are published, updated, or deleted.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Server Component
export default async function HomePage() {
  const [feedRes, trendingRes, categories] =
    await Promise.all([
      /*
       * Main published feed
       */
      postsApi.listPublished({ page: 1 }).catch(() => ({
        results: [] as PostSummary[],
        count: 0,
        next: null,
        previous: null,
      })),

      /*
       * Trending news
       */
      postsApi.listPublished({ trending: true }).catch(() => ({
        results: [] as PostSummary[],
        count: 0,
        next: null,
        previous: null,
      })),

      /*
       * Categories
       */
      categoriesApi.list().catch(() => []),
    ]);

  /*
   * ----------------------------------------------------------
   * HOMEPAGE DATA
   * ----------------------------------------------------------
   */

  const feed = feedRes.results;

  /*
   * First published post becomes the hero.
   */
  const hero = feed[0];

  /*
   * Posts 2-5 become Top Stories.
   */
  const topStories = feed.slice(1, 5);

  /*
   * Show the newest published posts in Latest News.
   *
   * Using slice(0, 6) means even when there are only
   * 1-5 published posts, they still appear in Latest News.
   */
  const latest = feed.slice(0, 6);

  /*
   * Trending section.
   */
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
        {/* ========================================= */}
        {/* HERO + TOP STORIES                      */}
        {/* ========================================= */}
        {hero && (
          <section className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* ===================================== */}
            {/* HERO                                  */}
            {/* ===================================== */}
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

                  {/* Hero overlay */}
                  <div
                    className="
                      absolute
                      inset-x-0
                      bottom-0
                      bg-gradient-to-t
                      from-black/90
                      via-black/55
                      to-transparent
                      px-4
                      pb-4
                      pt-12
                      sm:px-5
                      sm:pb-5
                      sm:pt-14
                      lg:px-6
                      lg:pb-6
                      lg:pt-16
                    "
                  >
                    {/* Category */}
                    {hero.category?.name && (
                      <span className="inline-block rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground sm:text-xs">
                        {hero.category.name}
                      </span>
                    )}

                    {/* Title */}
                    <h1
                      className="
                        mt-2
                        line-clamp-2
                        max-w-full
                        text-base
                        font-black
                        leading-snug
                        text-white
                        sm:text-lg
                        md:text-2xl
                        lg:text-3xl
                      "
                    >
                      {hero.title}
                    </h1>

                    {/* Summary */}
                    {hero.short_description && (
                      <p
                        className="
                          mt-1
                          line-clamp-1
                          max-w-full
                          text-xs
                          leading-relaxed
                          text-white/85
                          sm:text-sm
                        "
                      >
                        {hero.short_description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </div>

            {/* ===================================== */}
            {/* TOP STORIES                           */}
            {/* ===================================== */}
            <aside>
              <h2 className="mb-3 border-b-2 border-primary pb-2 text-sm font-black uppercase tracking-wide">
                Top Stories
              </h2>

              <div className="space-y-4">
                {topStories.length > 0 ? (
                  topStories.map((post) => (
                    <NewsCard
                      key={post.id}
                      post={post}
                      variant="horizontal"
                    />
                  ))
                ) : (
                  <p className="py-4 text-sm text-muted-foreground">
                    More top stories coming soon.
                  </p>
                )}
              </div>
            </aside>
          </section>
        )}

        {/* ========================================= */}
        {/* LATEST NEWS                             */}
        {/* ========================================= */}
        {latest.length > 0 && (
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
                <NewsCard
                  key={post.id}
                  post={post}
                />
              ))}
            </div>
          </section>
        )}

        {/* ========================================= */}
        {/* EXPLORE CATEGORIES                      */}
        {/* ========================================= */}
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
                  className="
                    rounded-lg
                    border
                    p-4
                    text-center
                    text-sm
                    font-semibold
                    transition
                    hover:border-primary
                    hover:text-primary
                  "
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ========================================= */}
        {/* TRENDING NOW                            */}
        {/* ========================================= */}
        {trending.length > 0 && (
          <section className="mt-12 rounded-xl bg-muted/40 p-6">
            <h2 className="mb-4 text-lg font-black uppercase tracking-wide">
              Trending Now
            </h2>

            <ol className="space-y-4">
              {trending.map((post, i) => (
                <li
                  key={post.id}
                  className="flex gap-4"
                >
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

        {/* ========================================= */}
        {/* NEWSLETTER                              */}
        {/* ========================================= */}
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