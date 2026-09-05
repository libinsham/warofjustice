import { apiClient } from "./client";
import { TokenStore } from "@/lib/token-storage";
import type { User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterReaderPayload {
  email: string;
  username: string;
  password: string;
}

export interface RegisterAuthorPayload extends RegisterReaderPayload {
  bio?: string;
}

export interface RegisterSubscriberPayload {
  email: string;
  username: string;
  password: string;
  full_name: string;
  phone_number: string;
  whatsapp_number?: string;
  channels_confirmed: string[];
  declaration_confirmed: boolean;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<User> {
    const { data } = await apiClient.post("/auth/login/", payload);
    TokenStore.setAccess(data.access);
    return data.user as User;
  },

  async registerReader(payload: RegisterReaderPayload): Promise<User> {
    const { data } = await apiClient.post("/auth/register/", payload);
    TokenStore.setAccess(data.access);
    return data.user as User;
  },

  /** Author accounts start `pending` — no tokens are issued yet. */
  async registerAuthor(payload: RegisterAuthorPayload): Promise<{ message: string; user: User }> {
    const { data } = await apiClient.post("/auth/register-author/", payload);
    return data;
  },

  /** Full "Subscriber" application — account + contact info + channel
   * follow confirmation. Issues tokens immediately like registerReader. */
  async registerSubscriber(payload: RegisterSubscriberPayload): Promise<User> {
    const { data } = await apiClient.post("/auth/register-subscriber/", payload);
    TokenStore.setAccess(data.access);
    return data.user as User;
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get("/auth/me/");
    return data as User;
  },

  async updateProfile(payload: Partial<{
    username: string; bio: string; avatar_url: string; twitter: string; facebook: string; website: string;
  }>): Promise<User> {
    const { data } = await apiClient.patch("/auth/me/", payload);
    return data as User;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await apiClient.post("/auth/change-password/", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await apiClient.post("/auth/forgot-password/", { email });
    return data;
  },

  async resetPassword(uid: string, token: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await apiClient.post("/auth/reset-password/", {
      uid,
      token,
      new_password: newPassword,
    });
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout/");
    } catch {
      // If the access token already expired, the server call will 401 —
      // that's fine, we still clear local state below regardless.
    }
    TokenStore.clear();
  },
};
