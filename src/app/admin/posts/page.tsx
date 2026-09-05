"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostStatusBadge } from "@/components/shared/post-status-badge";
import { postsApi } from "@/lib/api/posts";
import type { PostStatus } from "@/types";

const FILTERS: { value: PostStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "changes_requested", label: "Changes Requested" },
  { value: "approved", label: "Approved" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
];

export default function AllPostsPage() {
  const [filter, setFilter] = useState<PostStatus | "all">("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "posts", "all-view", filter],
    queryFn: () => postsApi.listForReview(filter === "all" ? {} : { status: filter }),
  });

  const posts = (data?.results ?? []).filter((p) =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold">All Posts</h2>
        <Input
          placeholder="Search by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as PostStatus | "all")}>
        <TabsList className="flex-wrap">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>{f.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No posts match this filter.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="max-w-xs truncate font-medium">{post.title}</TableCell>
                <TableCell>{post.author.username}</TableCell>
                <TableCell>{post.category?.name}</TableCell>
                <TableCell><PostStatusBadge status={post.status} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  {(post.status === "submitted" || post.status === "under_review") ? (
                    <Link href={`/admin/posts/${post.id}/review`} className="text-sm font-semibold text-primary hover:underline">
                      Review
                    </Link>
                  ) : post.status === "published" ? (
                    <Link href={`/article/${post.slug}`} target="_blank" className="text-sm font-semibold text-primary hover:underline">
                      View Public
                    </Link>
                  ) : (
                    <Link href={`/admin/posts/${post.id}/review`} className="text-sm font-semibold text-primary hover:underline">
                      View
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
