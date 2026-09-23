"use client";

import Link from "next/link";
import type { PostSummary } from "@/types";

export function BreakingTicker({
  posts,
}: {
  posts: PostSummary[];
}) {
  const latestPost = posts[0];

  if (!latestPost) {
    return null;
  }

  return (
    <div className="mb-5 flex h-10 w-full overflow-hidden bg-red-700 text-white">
      <div className="flex shrink-0 items-center bg-red-900 px-4 text-xs font-black uppercase tracking-wide">
        Breaking News
      </div>

      <div className="flex min-w-0 flex-1 items-center overflow-hidden">
        <div className="breaking-news-track">
          <Link
            href={`/article/${latestPost.slug}`}
            className="text-sm font-semibold hover:underline"
          >
            {latestPost.title}
          </Link>
        </div>
      </div>

      <style>{`
        .breaking-news-track {
          display: inline-block;
          white-space: nowrap;
          padding-left: 100%;
          animation: breaking-news-scroll 20s linear infinite;
        }

        .breaking-news-track:hover {
          animation-play-state: paused;
        }

        @keyframes breaking-news-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}