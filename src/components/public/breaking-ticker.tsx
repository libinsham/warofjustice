"use client";

import Link from "next/link";
import type { PostSummary } from "@/types";

/** Scrolling breaking-news bar. Expects the caller to pass posts already
 * filtered by `is_breaking` (see postsApi.listPublished({ breaking: true })). */
export function BreakingTicker({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null;

  return (
    <div className="flex items-center gap-3 overflow-hidden bg-primary px-4 py-2 text-primary-foreground">
      <span className="shrink-0 rounded bg-black/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
        Breaking
      </span>
      <div className="flex gap-8 overflow-x-auto whitespace-nowrap text-sm font-medium [scrollbar-width:none]">
        {posts.map((post) => (
          <Link key={post.id} href={`/article/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
