import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import type { PostSummary } from "@/types";

export function NewsCard({
  post,
  variant = "default",
}: {
  post: PostSummary;
  variant?: "default" | "compact" | "horizontal";
}) {
  const dateLabel = post.published_at
    ? formatDistanceToNow(new Date(post.published_at), {
        addSuffix: true,
      })
    : "";

  if (variant === "horizontal") {
    return (
      <Link
        href={`/article/${post.slug}`}
        className="group flex gap-3"
      >
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
          {post.featured_image_url ? (
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No Image
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
            {post.title}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {dateLabel}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/article/${post.slug}`}
        className="group block"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          {post.category?.name}
        </p>

        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
          {post.title}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {dateLabel}
        </p>
      </Link>
    );
  }

  return (
    <Link
      href={`/article/${post.slug}`}
      className="group block"
    >
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            No Image
          </div>
        )}
      </div>

      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-primary">
        {post.category?.name}
      </p>

      <p className="mt-1 line-clamp-2 text-base font-bold leading-snug group-hover:text-primary">
        {post.title}
      </p>

      <p className="mt-2 text-xs text-muted-foreground">
        {dateLabel}
      </p>
    </Link>
  );
}