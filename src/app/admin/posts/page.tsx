"use client";

import Link from "next/link";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Eye,
  Search,
  Trash2,
  RefreshCw,
  FileText,
  Loader2,
} from "lucide-react";

import { postsApi } from "@/lib/api/posts";
import type { Post, PostStatus } from "@/types";
import { useAuth } from "@/providers/auth-provider";

type FilterKey =
  | "all"
  | "draft"
  | "pending"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "published"
  | "rejected"
  | "archived";

const FILTERS: Array<{
  key: FilterKey;
  label: string;
  apiStatus?: PostStatus;
}> = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft", apiStatus: "draft" },
  { key: "pending", label: "Pending", apiStatus: "submitted" },
  {
    key: "under_review",
    label: "Under Review",
    apiStatus: "under_review",
  },
  {
    key: "changes_requested",
    label: "Changes Requested",
    apiStatus: "changes_requested",
  },
  {
    key: "approved",
    label: "Approved",
    apiStatus: "approved",
  },
  {
    key: "published",
    label: "Published",
    apiStatus: "published",
  },
  {
    key: "rejected",
    label: "Rejected",
    apiStatus: "rejected",
  },
  {
    key: "archived",
    label: "Archived",
    apiStatus: "archived",
  },
];

function getStatusLabel(status: string) {
  switch (status) {
    case "submitted":
      return "Pending Review";
    case "under_review":
      return "Under Review";
    case "changes_requested":
      return "Changes Requested";
    case "published":
      return "Published";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "archived":
      return "Archived";
    case "draft":
      return "Draft";
    default:
      return status;
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-700";

    case "submitted":
    case "under_review":
      return "bg-amber-100 text-amber-700";

    case "changes_requested":
      return "bg-orange-100 text-orange-700";

    case "approved":
      return "bg-blue-100 text-blue-700";

    case "rejected":
      return "bg-red-100 text-red-700";

    case "archived":
      return "bg-gray-200 text-gray-700";

    case "draft":
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function isReviewable(status: string) {
  return (
    status === "submitted" ||
    status === "under_review"
  );
}

export default function AdminPostsPage() {
  const { status: authStatus, isAdmin, isSuperAdmin } = useAuth();

  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] =
    useState<FilterKey>("all");

  const [search, setSearch] = useState("");

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const selectedFilter = FILTERS.find(
    (filter) => filter.key === activeFilter
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "admin",
      "posts",
      activeFilter,
      selectedFilter?.apiStatus,
    ],

    queryFn: () =>
      postsApi.listForReview({
        status: selectedFilter?.apiStatus,
        page: 1,
      }),

    enabled:
      authStatus === "authenticated" &&
      (isAdmin || isSuperAdmin),
  });

  const posts = data?.results ?? [];

  const filteredPosts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return posts;
    }

    return posts.filter((post) => {
      const title = post.title?.toLowerCase() ?? "";
      const author =
        post.author?.username?.toLowerCase() ?? "";
      const category =
        post.category?.name?.toLowerCase() ?? "";

      return (
        title.includes(term) ||
        author.includes(term) ||
        category.includes(term)
      );
    });
  }, [posts, search]);

  const handleDelete = async (post: Post) => {
    const confirmed = window.confirm(
      `Delete this post?\n\n"${post.title}"\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(post.id);

      await postsApi.adminRemove(post.id);

      await queryClient.invalidateQueries({
        queryKey: ["admin"],
      });
    } catch (error) {
      console.error("Failed to delete post:", error);

      window.alert(
        "Unable to delete this post. Please check your permissions and try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (authStatus === "loading") {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-lg font-bold">
          Access denied
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          You do not have permission to access the Admin
          Posts section.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-black">
            All Posts
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage, review, publish and delete news
            articles.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by title..."
              className="h-10 w-full rounded-md border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 sm:w-72"
            />
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-white px-4 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isFetching
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="overflow-x-auto">
        <div className="inline-flex min-w-max rounded-xl border bg-muted/30 p-1">
          {FILTERS.map((filter) => {
            const active =
              activeFilter === filter.key;

            return (
              <button
                key={filter.key}
                type="button"
                onClick={() =>
                  setActiveFilter(filter.key)
                }
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load posts from the server.
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />

          <p className="mt-3 text-sm text-muted-foreground">
            Loading posts...
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          {/* Table header */}
          <div className="hidden grid-cols-[minmax(280px,1.8fr)_150px_150px_180px_160px_260px] gap-4 border-b bg-muted/30 px-4 py-4 text-sm font-semibold text-muted-foreground lg:grid">
            <div>Title</div>
            <div>Author</div>
            <div>Category</div>
            <div>Status</div>
            <div>Updated</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Empty */}
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />

              <h3 className="mt-4 font-bold">
                No posts found
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {search
                  ? "Try a different search."
                  : "There are no posts in this section."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredPosts.map((post) => {
                const isDeleting =
                  deletingId === post.id;

                const updatedText =
                  post.updated_at
                    ? formatDistanceToNow(
                        new Date(post.updated_at),
                        {
                          addSuffix: true,
                        }
                      )
                    : "—";

                return (
                  <div
                    key={post.id}
                    className="grid gap-4 px-4 py-4 transition hover:bg-muted/20 lg:grid-cols-[minmax(280px,1.8fr)_150px_150px_180px_160px_260px] lg:items-center"
                  >
                    {/* Title */}
                    <div className="min-w-0">
                      <Link
                        href={
                          post.status ===
                            "published"
                            ? `/article/${post.slug}`
                            : `/admin/posts/${post.id}/review`
                        }
                        className="block truncate font-medium hover:text-primary"
                        title={post.title}
                      >
                        {post.title}
                      </Link>

                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground lg:hidden">
                        <span>
                          {post.author?.username ??
                            "Unknown author"}
                        </span>

                        <span>•</span>

                        <span>
                          {post.category?.name ??
                            "Uncategorized"}
                        </span>
                      </div>
                    </div>

                    {/* Author */}
                    <div className="hidden truncate text-sm text-muted-foreground lg:block">
                      {post.author?.username ??
                        "Unknown"}
                    </div>

                    {/* Category */}
                    <div className="hidden truncate text-sm text-muted-foreground lg:block">
                      {post.category?.name ??
                        "Uncategorized"}
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          post.status
                        )}`}
                      >
                        {getStatusLabel(
                          post.status
                        )}
                      </span>
                    </div>

                    {/* Updated */}
                    <div className="hidden text-sm text-muted-foreground lg:block">
                      {updatedText}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
                      {post.status === "published" ? (
                        <Link
                          href={`/article/${post.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                        >
                          <Eye className="h-4 w-4" />
                          View Public
                        </Link>
                      ) : isReviewable(
                          post.status
                        ) ? (
                        <Link
                          href={`/admin/posts/${post.id}/review`}
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          Review
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/posts/${post.id}/review`}
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          View
                        </Link>
                      )}

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(post)
                        }
                        disabled={isDeleting}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}

                        {isDeleting
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer information */}
      <div className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-semibold">
          {filteredPosts.length}
        </span>{" "}
        post
        {filteredPosts.length === 1 ? "" : "s"}
        {search ? " matching your search" : ""}.
      </div>
    </div>
  );
}