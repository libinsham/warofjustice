import { apiClient } from "./client";
import type { Paginated, Post, PostStatus, PostSummary, PostWritePayload } from "@/types";

export interface PublicPostFilters {
  category?: string;
  search?: string;
  breaking?: boolean;
  trending?: boolean;
  page?: number;
}

export const postsApi = {
  // ---- Public (unauthenticated) ----

  async listPublished(filters: PublicPostFilters = {}): Promise<Paginated<PostSummary>> {
    const { data } = await apiClient.get<Paginated<PostSummary>>("/posts/", {
      params: {
        category: filters.category,
        search: filters.search,
        breaking: filters.breaking ? "true" : undefined,
        trending: filters.trending ? "true" : undefined,
        page: filters.page,
      },
    });
    return data;
  },

  async getBySlug(slug: string): Promise<Post> {
    const { data } = await apiClient.get<Post>(`/posts/${slug}/`);
    return data;
  },

  // ---- Author dashboard ----

  async listMine(params: { status?: PostStatus; page?: number } = {}): Promise<Paginated<Post>> {
    const { data } = await apiClient.get<Paginated<Post>>("/dashboard/posts/", { params });
    return data;
  },

  async retrieveMine(id: number): Promise<Post> {
    const { data } = await apiClient.get<Post>(`/dashboard/posts/${id}/`);
    return data;
  },

  async create(payload: PostWritePayload): Promise<Post> {
    const { data } = await apiClient.post<Post>("/dashboard/posts/", payload);
    return data;
  },

  async update(id: number, payload: Partial<PostWritePayload>): Promise<Post> {
    const { data } = await apiClient.put<Post>(`/dashboard/posts/${id}/`, payload);
    return data;
  },

  async submitForReview(id: number): Promise<Post> {
    const { data } = await apiClient.post<Post>(`/dashboard/posts/${id}/submit/`);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/dashboard/posts/${id}/`);
  },

  // ---- Admin / Editor / Super Admin (approval workflow) ----

  async listForReview(params: { status?: PostStatus; page?: number } = {}): Promise<Paginated<Post>> {
    const { data } = await apiClient.get<Paginated<Post>>("/admin/posts/", { params });
    return data;
  },

  async retrieveForReview(id: number): Promise<Post> {
    const { data } = await apiClient.get<Post>(`/admin/posts/${id}/`);
    return data;
  },

  async approve(id: number, publishImmediately: boolean): Promise<Post> {
    const { data } = await apiClient.post<Post>(`/admin/posts/${id}/approve/`, {
      publish_immediately: publishImmediately,
    });
    return data;
  },

  async reject(id: number, note: string): Promise<Post> {
    const { data } = await apiClient.post<Post>(`/admin/posts/${id}/reject/`, { note });
    return data;
  },

  async requestChanges(id: number, note: string): Promise<Post> {
    const { data } = await apiClient.post<Post>(`/admin/posts/${id}/request-changes/`, { note });
    return data;
  },

  async publish(id: number): Promise<Post> {
    const { data } = await apiClient.post<Post>(`/admin/posts/${id}/publish/`);
    return data;
  },

  async archive(id: number): Promise<Post> {
    const { data } = await apiClient.post<Post>(`/admin/posts/${id}/archive/`);
    return data;
  },
};
