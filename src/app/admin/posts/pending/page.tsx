"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { postsApi } from "@/lib/api/posts";

export default function PendingPostsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "posts", "pending-queue"],
    queryFn: () => postsApi.listForReview({ status: "submitted" }),
  });

  const posts = data?.results ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Pending Review</h2>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Nothing pending review. 🎉</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="max-w-xs truncate font-medium">{post.title}</TableCell>
                <TableCell>{post.author.username}</TableCell>
                <TableCell>{post.category?.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm">
                    <Link href={`/admin/posts/${post.id}/review`}>Review</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
