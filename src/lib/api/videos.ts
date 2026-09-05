import { apiClient } from "./client";
import type { Paginated, Video, VideoFeedItem } from "@/types";

export const videosApi = {
  async listPublished(page = 1): Promise<Paginated<VideoFeedItem>> {
    const { data } = await apiClient.get<Paginated<VideoFeedItem>>("/videos/", { params: { page } });
    return data;
  },

  async getBySlug(slug: string): Promise<VideoFeedItem> {
    const { data } = await apiClient.get<VideoFeedItem>(`/videos/${slug}/`);
    return data;
  },

  /** Super Admin / Admin only — full library across all users. */
  async listAllAdmin(): Promise<Video[]> {
    const { data } = await apiClient.get<Paginated<Video>>("/admin/videos/");
    return data.results;
  },
};
