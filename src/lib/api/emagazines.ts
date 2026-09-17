import { TokenStore } from "@/lib/token-storage";
import type { Emagazine } from "@/types/emagazine";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.warofjustice.news/api/v1"
).replace(/\/$/, "");

function getAuthHeaders(
  extra: Record<string, string> = {}
): Record<string, string> {
  const token = TokenStore.getAccess();

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...extra,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";

  let data: unknown;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    if (typeof data === "string" && data) {
      message = data;
    }

    if (
      typeof data === "object" &&
      data !== null &&
      "detail" in data &&
      typeof (data as { detail?: unknown }).detail === "string"
    ) {
      message = (data as { detail: string }).detail;
    }

    throw new Error(message);
  }

  return data as T;
}

export async function getEmagazines(): Promise<Emagazine[]> {
  const response = await fetch(`${API_BASE_URL}/emagazines/`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  return handleResponse<Emagazine[]>(response);
}

export async function getEmagazine(id: number): Promise<Emagazine> {
  const response = await fetch(`${API_BASE_URL}/emagazines/${id}/`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  return handleResponse<Emagazine>(response);
}

export async function createEmagazine(
  formData: FormData
): Promise<Emagazine> {
  const response = await fetch(`${API_BASE_URL}/emagazines/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  return handleResponse<Emagazine>(response);
}

export async function updateEmagazineStatus(
  id: number,
  status: "draft" | "published"
): Promise<Emagazine> {
  const response = await fetch(`${API_BASE_URL}/emagazines/${id}/`, {
    method: "PATCH",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      status,
    }),
  });

  return handleResponse<Emagazine>(response);
}

export async function deleteEmagazine(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/emagazines/${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    await handleResponse(response);
  }
}