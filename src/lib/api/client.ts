import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { API_URL } from "@/lib/env";
import { TokenStore } from "@/lib/token-storage";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // sends the httpOnly refresh-token cookie automatically
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = TokenStore.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  // De-duplicate concurrent 401s into a single refresh call.
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh/`, {}, { withCredentials: true })
      .then((res) => {
        const newToken = res.data.access as string;
        TokenStore.setAccess(newToken);
        return newToken;
      })
      .catch(() => {
        TokenStore.clear();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
      // Session truly expired — let calling code (e.g. AuthProvider) redirect to /login.
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("newshub:session-expired"));
      }
    }
    return Promise.reject(error);
  }
);
