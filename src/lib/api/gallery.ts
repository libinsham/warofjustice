import { apiClient } from "./client";
import type { Paginated, PostSummary } from "@/types";

export const galleryApi = {
  async listPublished(page = 1): Promise<Paginated<PostSummary>> {
    const { data } = await apiClient.get<Paginated<PostSummary>>("/gallery/", { params: { page } });
    return data;
  },
};
