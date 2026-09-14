import { apiClient } from "./client";
import type { Paginated } from "@/types";

export interface SiteSetting {
  id: number;
  key: string;
  value: unknown;
  value_type: "text" | "json" | "boolean" | "image";
  updated_at: string;
}

export const settingsApi = {
  async list(): Promise<SiteSetting[]> {
    const { data } = await apiClient.get<Paginated<SiteSetting>>("/settings/");
    return data.results;
  },

  /** Super Admin only. Creates the key if it doesn't exist, otherwise updates it. */
  async upsert(key: string, value: unknown, valueType: SiteSetting["value_type"] = "text"): Promise<SiteSetting> {
    try {
      const { data } = await apiClient.patch<SiteSetting>(`/settings/${key}/`, { value, value_type: valueType });
      return data;
    } catch {
      const { data } = await apiClient.post<SiteSetting>("/settings/", { key, value, value_type: valueType });
      return data;
    }
  },
};
