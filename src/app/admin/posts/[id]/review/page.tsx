"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { PostStatusBadge } from "@/components/shared/post-status-badge";
import { postsApi } from "@/lib/api/posts";

export default function PostReviewPage() {
  const params = useParams<{ id: string }>();
  const postId = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [feedback, setFeedback] = useState("");
  const [publishImmediately, setPublishImmediately] = useState(true);

  const { data: post, isLoading } = useQuery({
    queryKey: ["admin", "post", postId],
    queryFn: () => postsApi.retrieveForReview(postId),
  });

  const invalidateAndReturn = () => {
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    router.push("/admin/posts/pending");
  };

  const approveMutation = useMutation({
    mutationFn: () => postsApi.approve(postId, publishImmediately),
    onSuccess: invalidateAndReturn,
  });
  const rejectMutation = useMutation({
    mutationFn: () => postsApi.reject(postId, feedback),
    onSuccess: invalidateAndReturn,
  });
  const requestChangesMutation = useMutation({
    mutationFn: () => postsApi.requestChanges(postId, feedback),
    onSuccess: invalidateAndReturn,
  });

  const feedbackRequired = rejectMutation.isPending || requestChangesMutation.isPending || feedback.trim().length === 0;

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!post) return <p className="text-sm text-muted-foreground">Post not found.</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* LEFT: full article preview */}
      <article className="space-y-4">
        <Badge>{post.category?.name}</Badge>
        <h1 className="text-2xl font-black leading-tight">{post.title}</h1>
        {post.short_description && <p className="text-muted-foreground">{post.short_description}</p>}

        {post.featured_image_url && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <Image src={post.featured_image_url} alt={post.title} fill className="object-cover" sizes="60vw" />
          </div>
        )}

        <div
          className="prose prose-neutral max-w-none rounded-lg border p-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((t) => <Badge key={t.id} variant="secondary">#{t.name}</Badge>)}
          </div>
        )}
      </article>

      {/* RIGHT: moderation controls */}
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Status</CardTitle></CardHeader>
          <CardContent><PostStatusBadge status={post.status} /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Author</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <Avatar><AvatarFallback>{post.author.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
            <div>
              <p className="text-sm font-semibold">{post.author.username}</p>
              <p className="text-xs text-muted-foreground">{post.author.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Submission History</CardTitle></CardHeader>
          <CardContent>
            {post.approval_history.length === 0 ? (
              <p className="text-xs text-muted-foreground">No history yet.</p>
            ) : (
              <ul className="space-y-3">
                {post.approval_history.map((event, i) => (
                  <li key={i} className="text-xs">
                    <p className="font-semibold capitalize">{event.action.replace("_", " ")}</p>
                    {event.note && <p className="mt-0.5 text-muted-foreground">{event.note}</p>}
                    <p className="mt-0.5 text-muted-foreground">
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </p>
                    {i < post.approval_history.length - 1 && <Separator className="mt-3" />}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {(post.status === "submitted" || post.status === "under_review") && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Moderation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="feedback">Feedback (required for reject / request changes)</Label>
                <Textarea
                  id="feedback"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Explain what needs to change…"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={publishImmediately}
                  onChange={(e) => setPublishImmediately(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                Publish immediately on approval
              </label>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate()}
                >
                  {publishImmediately ? "Approve & Publish" : "Approve"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={feedbackRequired}
                  onClick={() => requestChangesMutation.mutate()}
                >
                  Request Changes
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={feedbackRequired}
                  onClick={() => rejectMutation.mutate()}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {post.status === "approved" && (
          <Button className="w-full" onClick={() => postsApi.publish(postId).then(invalidateAndReturn)}>
            Publish Now
          </Button>
        )}
      </div>
    </div>
  );
}
