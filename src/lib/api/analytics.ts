import { apiClient } from "./client";

export interface AnalyticsSummary {
  total_posts: number;
  published_posts: number;
  pending_posts: number;
  draft_posts: number;
  rejected_posts: number;
  total_authors: number;
  total_views: number;
  total_videos: number;
  total_categories: number;
}

export interface TopPost {
  id: number;
  title: string;
  slug: string;
  views: number;
  author: string;
  category: string | null;
  published_at: string | null;
}

export interface CategoryBreakdownItem {
  id: number;
  name: string;
  slug: string;
  post_count: number;
}

export interface PublishingTrendPoint {
  date: string;
  count: number;
}

export const analyticsApi = {
  async summary(): Promise<AnalyticsSummary> {
    const { data } = await apiClient.get<AnalyticsSummary>("/admin/analytics/summary/");
    return data;
  },

  async topPosts(limit = 10): Promise<TopPost[]> {
    const { data } = await apiClient.get<TopPost[]>("/admin/analytics/top-posts/", { params: { limit } });
    return data;
  },

  async categoryBreakdown(): Promise<CategoryBreakdownItem[]> {
    const { data } = await apiClient.get<CategoryBreakdownItem[]>("/admin/analytics/category-breakdown/");
    return data;
  },

  async publishingTrend(days = 30): Promise<PublishingTrendPoint[]> {
    const { data } = await apiClient.get<PublishingTrendPoint[]>("/admin/analytics/publishing-trend/", { params: { days } });
    return data;
  },
};
