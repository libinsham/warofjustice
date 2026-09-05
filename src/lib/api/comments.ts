import { apiClient } from "./client";
import type { Comment, Paginated } from "@/types";

export const commentsApi = {
  async listForPost(postId: number): Promise<Comment[]> {
    const { data } = await apiClient.get<Paginated<Comment>>("/comments/", { params: { post: postId } });
    return data.results;
  },

  async create(postId: number, body: string, parent?: number): Promise<Comment> {
    const { data } = await apiClient.post("/comments/", { post: postId, body, parent });
    return data;
  },

  /** Admin/Editor/Super Admin moderation queue. */
  async listForModeration(status?: Comment["status"]): Promise<Comment[]> {
    const { data } = await apiClient.get<Paginated<Comment>>("/admin/comments/", { params: { status } });
    return data.results;
  },

  async moderate(id: number, status: Comment["status"]): Promise<Comment> {
    const { data } = await apiClient.post(`/admin/comments/${id}/moderate/`, { status });
    return data;
  },
};
