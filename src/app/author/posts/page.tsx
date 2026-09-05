"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostStatusBadge } from "@/components/shared/post-status-badge";
import { postsApi } from "@/lib/api/posts";
import type { Post, PostStatus } from "@/types";

const FILTERS: { value: PostStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Pending" },
  { value: "changes_requested", label: "Changes Requested" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
];

export default function MyPostsPage() {
  const [filter, setFilter] = useState<PostStatus | "all">("all");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "my-posts", filter],
    queryFn: () => postsApi.listMine(filter === "all" ? {} : { status: filter }),
  });

  const submitMutation = useMutation({
    mutationFn: (id: number) => postsApi.submitForReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard", "my-posts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => postsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard", "my-posts"] }),
  });

  const posts = data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as PostStatus | "all")}>
          <TabsList className="flex-wrap">
            {FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>{f.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button asChild size="sm">
          <Link href="/author/posts/new"><PlusCircle className="h-4 w-4" />New Post</Link>
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No posts in this filter.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <PostRow
                key={post.id}
                post={post}
                onSubmit={() => submitMutation.mutate(post.id)}
                onDelete={() => deleteMutation.mutate(post.id)}
                submitting={submitMutation.isPending}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function PostRow({
  post, onSubmit, onDelete, submitting,
}: {
  post: Post;
  onSubmit: () => void;
  onDelete: () => void;
  submitting: boolean;
}) {
  return (
    <TableRow>
      <TableCell className="max-w-xs truncate font-medium">{post.title}</TableCell>
      <TableCell>{post.category?.name}</TableCell>
      <TableCell><PostStatusBadge status={post.status} /></TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}
      </TableCell>
      <TableCell className="max-w-xs truncate text-xs text-muted-foreground">{post.review_note || "—"}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {/* Action set depends on status, exactly per spec */}
          {(post.status === "draft" || post.status === "changes_requested" || post.status === "rejected") && (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/author/posts/${post.id}/edit`}>Edit</Link>
              </Button>
              <Button size="sm" onClick={onSubmit} disabled={submitting}>
                {post.status === "draft" ? "Submit" : "Resubmit"}
              </Button>
            </>
          )}
          {(post.status === "submitted" || post.status === "under_review") && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/author/posts/${post.id}/edit`}>View</Link>
            </Button>
          )}
          {post.status === "published" && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/article/${post.slug}`} target="_blank">View Public</Link>
            </Button>
          )}
          {post.status === "draft" && (
            <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
