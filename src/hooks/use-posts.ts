"use client";

import { useQuery } from "@tanstack/react-query";

import { postsApi, type PublicPostFilters } from "@/lib/api/posts";

export function usePublishedPosts(filters: PublicPostFilters = {}) {
  return useQuery({
    queryKey: ["posts", "published", filters],
    queryFn: () => postsApi.listPublished(filters),
  });
}

export function usePostBySlug(slug: string) {
  return useQuery({
    queryKey: ["posts", "detail", slug],
    queryFn: () => postsApi.getBySlug(slug),
    enabled: !!slug,
  });
}
