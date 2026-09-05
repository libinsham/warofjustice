"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { PostEditorForm } from "@/components/author/post-editor-form";
import { postsApi } from "@/lib/api/posts";

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const postId = Number(params.id);

  const { data: post, isLoading } = useQuery({
    queryKey: ["dashboard", "post", postId],
    queryFn: () => postsApi.retrieveMine(postId),
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!post) return <p className="text-sm text-muted-foreground">Post not found.</p>;

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold">Edit Post</h2>
      <PostEditorForm existingPost={post} />
    </div>
  );
}
