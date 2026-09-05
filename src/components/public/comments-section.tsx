"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { commentsApi } from "@/lib/api/comments";
import { useAuth } from "@/providers/auth-provider";

export function CommentsSection({ postId }: { postId: number }) {
  const { user, status } = useAuth();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => commentsApi.listForPost(postId),
  });

  const postMutation = useMutation({
    mutationFn: (text: string) => commentsApi.create(postId, text),
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-black uppercase tracking-wide">
        <MessageCircle className="h-5 w-5" />
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      {status === "authenticated" ? (
        <form
          className="mb-8 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (body.trim()) postMutation.mutate(body.trim());
          }}
        >
          <Textarea
            placeholder="Share your thoughts…"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button type="submit" size="sm" disabled={postMutation.isPending || !body.trim()}>
            {postMutation.isPending ? "Posting…" : "Post Comment"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Comments are reviewed before they appear publicly.
          </p>
        </form>
      ) : (
        <p className="mb-8 rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">
          <a href="/login" className="font-semibold text-primary hover:underline">Sign in</a> to join the conversation.
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Be the first to comment.</p>
      ) : (
        <ul className="space-y-6">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <Avatar>
                <AvatarFallback>{comment.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{comment.user.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
                <p className="mt-1 text-sm">{comment.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
