import { apiClient } from "./client";
import type {
  Paginated,
  Post,
  PostStatus,
  PostSummary,
  PostWritePayload,
} from "@/types";

export interface PublicPostFilters {
  category?: string;
  search?: string;
  breaking?: boolean;
  trending?: boolean;
  page?: number;
}

export interface AdminPostFilters {
  status?: PostStatus;
  page?: number;
}

export const postsApi = {
  // =========================================================
  // PUBLIC
  // =========================================================

  async listPublished(
    filters: PublicPostFilters = {}
  ): Promise<Paginated<PostSummary>> {
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

  // =========================================================
  // AUTHOR DASHBOARD
  // =========================================================

  async listMine(
    params: { status?: PostStatus; page?: number } = {}
  ): Promise<Paginated<Post>> {
    const { data } = await apiClient.get<Paginated<Post>>(
      "/dashboard/posts/",
      { params }
    );

    return data;
  },

  async retrieveMine(id: number): Promise<Post> {
    const { data } = await apiClient.get<Post>(
      `/dashboard/posts/${id}/`
    );

    return data;
  },

  async create(payload: PostWritePayload): Promise<Post> {
    const { data } = await apiClient.post<Post>(
      "/dashboard/posts/",
      payload
    );

    return data;
  },

  async update(
    id: number,
    payload: Partial<PostWritePayload>
  ): Promise<Post> {
    const { data } = await apiClient.put<Post>(
      `/dashboard/posts/${id}/`,
      payload
    );

    return data;
  },

  async submitForReview(id: number): Promise<Post> {
    const { data } = await apiClient.post<Post>(
      `/dashboard/posts/${id}/submit/`
    );

    return data;
  },

  // Author can delete their own post if backend permits it.
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/dashboard/posts/${id}/`);
  },

  // =========================================================
  // ADMIN / EDITOR / SUPER ADMIN
  // =========================================================

  async listForReview(
    params: AdminPostFilters = {}
  ): Promise<Paginated<Post>> {
    const { data } = await apiClient.get<Paginated<Post>>(
      "/admin/posts/",
      { params }
    );

    return data;
  },

  async retrieveForReview(id: number): Promise<Post> {
    const { data } = await apiClient.get<Post>(
      `/admin/posts/${id}/`
    );

    return data;
  },

  async approve(
    id: number,
    publishImmediately: boolean
  ): Promise<Post> {
    const { data } = await apiClient.post<Post>(
      `/admin/posts/${id}/approve/`,
      {
        publish_immediately: publishImmediately,
      }
    );

    return data;
  },

  async reject(
    id: number,
    note: string
  ): Promise<Post> {
    const { data } = await apiClient.post<Post>(
      `/admin/posts/${id}/reject/`,
      { note }
    );

    return data;
  },

  async requestChanges(
    id: number,
    note: string
  ): Promise<Post> {
    const { data } = await apiClient.post<Post>(
      `/admin/posts/${id}/request-changes/`,
      { note }
    );

    return data;
  },

  async publish(id: number): Promise<Post> {
    const { data } = await apiClient.post<Post>(
      `/admin/posts/${id}/publish/`
    );

    return data;
  },

  async archive(id: number): Promise<Post> {
    const { data } = await apiClient.post<Post>(
      `/admin/posts/${id}/archive/`
    );

    return data;
  },

  // Admin / Super Admin delete
  async adminRemove(id: number): Promise<void> {
    await apiClient.delete(`/admin/posts/${id}/`);
  },
};