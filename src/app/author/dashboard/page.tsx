"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PostStatusBadge } from "@/components/shared/post-status-badge";
import { postsApi } from "@/lib/api/posts";
import type { Post, PostStatus } from "@/types";

function countByStatus(posts: Post[]) {
  const pendingStatuses: PostStatus[] = ["submitted", "under_review"];
  const attentionStatuses: PostStatus[] = ["changes_requested", "rejected"];
  return {
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    pending: posts.filter((p) => pendingStatuses.includes(p.status)).length,
    draft: posts.filter((p) => p.status === "draft").length,
    attention: posts.filter((p) => attentionStatuses.includes(p.status)).length,
  };
}

export default function AuthorDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "my-posts", "all"],
    queryFn: () => postsApi.listMine({}),
  });

  const posts = data?.results ?? [];
  const counts = countByStatus(posts);
  const recent = posts.slice(0, 6);

  const summaryCards = [
    { label: "Total Posts", value: counts.total },
    { label: "Published", value: counts.published },
    { label: "Pending Review", value: counts.pending },
    { label: "Draft Posts", value: counts.draft },
    { label: "Needs Attention", value: counts.attention },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Overview of your submissions.</p>
        <Button asChild>
          <Link href="/author/posts/new"><PlusCircle className="h-4 w-4" />Create New Post</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          : summaryCards.map((card) => (
              <Card key={card.label}>
                <CardContent className="pt-6">
                  <p className="text-3xl font-black">{card.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.label}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No posts yet. Create your first one to get started.
            </p>
          ) : (
            recent.map((post) => (
              <Link
                key={post.id}
                href={`/author/posts/${post.id}/edit`}
                className="flex items-center justify-between rounded-md px-3 py-3 text-sm hover:bg-accent"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{post.title}</p>
                  <p className="text-xs text-muted-foreground">{post.category?.name}</p>
                </div>
                <PostStatusBadge status={post.status} />
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
