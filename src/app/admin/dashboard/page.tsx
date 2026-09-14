"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Bar, BarChart, CartesianGrid,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PostStatusBadge } from "@/components/shared/post-status-badge";
import { analyticsApi } from "@/lib/api/analytics";
import { postsApi } from "@/lib/api/posts";

export default function AdminDashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["admin", "analytics", "summary"],
    queryFn: () => analyticsApi.summary(),
  });

  const { data: trend, isLoading: loadingTrend } = useQuery({
    queryKey: ["admin", "analytics", "trend"],
    queryFn: () => analyticsApi.publishingTrend(30),
  });

  const { data: categoryBreakdown, isLoading: loadingCategories } = useQuery({
    queryKey: ["admin", "analytics", "categories"],
    queryFn: () => analyticsApi.categoryBreakdown(),
  });

  const { data: pending, isLoading: loadingPending } = useQuery({
    queryKey: ["admin", "posts", "pending"],
    queryFn: () => postsApi.listForReview({ status: "submitted" }),
  });

  const statCards = summary
    ? [
        { label: "Total Posts", value: summary.total_posts },
        { label: "Pending Posts", value: summary.pending_posts },
        { label: "Published Posts", value: summary.published_posts },
        { label: "Total Authors", value: summary.total_authors },
        { label: "Total Views", value: summary.total_views.toLocaleString() },
        { label: "Total Videos", value: summary.total_videos },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {loadingSummary
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          : statCards.map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-6">
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Posts Published (Last 30 Days)</CardTitle></CardHeader>
          <CardContent>
            {loadingTrend ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trend ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d: string) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    fontSize={11}
                    interval={4}
                  />
                  <YAxis allowDecimals={false} fontSize={11} width={30} />
                  <Tooltip labelFormatter={(d) => (d ? new Date(String(d)).toLocaleDateString() : "")} />
                  <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Published Posts by Category</CardTitle></CardHeader>
          <CardContent>
            {loadingCategories ? (
              <Skeleton className="h-64 w-full" />
            ) : (categoryBreakdown ?? []).length === 0 ? (
              <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">No categories yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis allowDecimals={false} fontSize={11} width={30} />
                  <Tooltip />
                  <Bar dataKey="post_count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pending Approval Queue</CardTitle>
          <Link href="/admin/posts/pending" className="text-sm font-semibold text-primary hover:underline">
            View all →
          </Link>
        </CardHeader>
        <CardContent className="space-y-1">
          {loadingPending ? (
            <Skeleton className="h-40 w-full" />
          ) : (pending?.results.length ?? 0) === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nothing pending review. 🎉</p>
          ) : (
            pending!.results.slice(0, 6).map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}/review`}
                className="flex items-center justify-between rounded-md px-3 py-3 text-sm hover:bg-accent"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    by {post.author.username} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
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
