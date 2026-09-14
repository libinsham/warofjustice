import { apiClient } from "./client";
import type { Category, Paginated, Tag } from "@/types";

export const categoriesApi = {
  async list(): Promise<Category[]> {
    const { data } = await apiClient.get<Paginated<Category>>("/categories/");
    return data.results;
  },

  async create(payload: { name: string; description?: string; parent?: number | null }): Promise<Category> {
    const { data } = await apiClient.post("/categories/", payload);
    return data;
  },

  async update(id: number, payload: Partial<{ name: string; description: string }>): Promise<Category> {
    const { data } = await apiClient.patch(`/categories/${id}/`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}/`);
  },

  async listTags(): Promise<Tag[]> {
    const { data } = await apiClient.get<Paginated<Tag>>("/tags/");
    return data.results;
  },
};
