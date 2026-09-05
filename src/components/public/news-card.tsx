import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import type { PostSummary } from "@/types";

export function NewsCard({ post, variant = "default" }: { post: PostSummary; variant?: "default" | "compact" | "horizontal" }) {
  const dateLabel = post.published_at
    ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true })
    : "";

  if (variant === "horizontal") {
    return (
      <Link href={`/article/${post.slug}`} className="group flex gap-3">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
          {post.featured_image_url && (
            <Image src={post.featured_image_url} alt={post.title} fill className="object-cover transition group-hover:scale-105" sizes="112px" />
          )}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">{post.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{dateLabel}</p>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/article/${post.slug}`} className="group block">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">{post.category?.name}</p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">{post.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{dateLabel}</p>
      </Link>
    );
  }

  return (
    <Link href={`/article/${post.slug}`} className="group block">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        {post.featured_image_url && (
          <Image src={post.featured_image_url} alt={post.title} fill className="object-cover transition group-hover:scale-105" sizes="(min-width: 1024px) 33vw, 100vw" />
        )}
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-primary">{post.category?.name}</p>
      <p className="mt-1 line-clamp-2 text-base font-bold leading-snug group-hover:text-primary">{post.title}</p>
      <p className="mt-2 text-xs text-muted-foreground">{dateLabel}</p>
    </Link>
  );
}
