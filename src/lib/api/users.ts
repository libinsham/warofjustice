import { apiClient } from "./client";
import type { Paginated, RoleName, User } from "@/types";

export const usersApi = {
  /** Super Admin only. */
  async list(params: { role?: RoleName; status?: string; search?: string } = {}): Promise<User[]> {
    const { data } = await apiClient.get<Paginated<User>>("/super-admin/users/", { params });
    return data.results;
  },

  async setRole(userId: number, role: RoleName): Promise<User> {
    const { data } = await apiClient.post(`/super-admin/users/${userId}/set-role/`, { role });
    return data;
  },

  async setStatus(userId: number, status: "active" | "suspended" | "pending"): Promise<User> {
    const { data } = await apiClient.post(`/super-admin/users/${userId}/set-status/`, { status });
    return data;
  },
};
