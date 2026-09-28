
import { TokenStore } from "@/lib/token-storage";
import type { Emagazine } from "@/types/emagazine";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.warofjustice.news/api/v1"
).replace(/\/+$/, "");

/* =========================================================
   AUTH HEADERS
========================================================= */

function getAuthHeaders(
  extra: Record<string, string> = {},
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

/* =========================================================
   RESPONSE HANDLER
========================================================= */

async function handleResponse<T>(
  response: Response,
): Promise<T> {
  const contentType =
    response.headers.get("content-type") || "";

  let data: unknown;

  if (response.status === 204) {
    data = undefined;
  } else if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    if (typeof data === "string" && data.trim()) {
      message = data;
    } else if (
      typeof data === "object" &&
      data !== null
    ) {
      const errorData = data as Record<string, unknown>;

      for (const key of [
        "detail",
        "message",
        "error",
      ]) {
        const value = errorData[key];

        if (typeof value === "string" && value.trim()) {
          message = value;
          break;
        }
      }

      if (message.startsWith("Request failed")) {
        const firstError = Object.values(errorData).find(
          (value) =>
            typeof value === "string" ||
            (Array.isArray(value) && value.length > 0),
        );

        if (typeof firstError === "string") {
          message = firstError;
        } else if (Array.isArray(firstError)) {
          message = String(firstError[0]);
        }
      }
    }

    throw new Error(message);
  }

  return data as T;
}

/* =========================================================
   GET ALL E-MAGAZINES
========================================================= */

export async function getEmagazines(): Promise<Emagazine[]> {
  const response = await fetch(
    `${API_BASE_URL}/emagazines/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    },
  );

  return handleResponse<Emagazine[]>(response);
}

/* =========================================================
   GET SINGLE E-MAGAZINE
========================================================= */

export async function getEmagazine(
  id: number,
): Promise<Emagazine> {
  const response = await fetch(
    `${API_BASE_URL}/emagazines/${id}/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    },
  );

  return handleResponse<Emagazine>(response);
}

/* =========================================================
   CREATE E-MAGAZINE
========================================================= */

export async function createEmagazine(
  formData: FormData,
): Promise<Emagazine> {
  const response = await fetch(
    `${API_BASE_URL}/emagazines/`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    },
  );

  return handleResponse<Emagazine>(response);
}

/* =========================================================
   UPDATE E-MAGAZINE
   PATCH /api/v1/emagazines/{id}/

   Supports:
   - Title
   - Issue number
   - Publication date
   - Description
   - Status
   - Replacement featured image
   - Replacement PDF

   Existing files are retained when omitted from FormData.
========================================================= */

export async function updateEmagazine(
  id: number,
  formData: FormData,
): Promise<Emagazine> {
  const response = await fetch(
    `${API_BASE_URL}/emagazines/${id}/`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: formData,
    },
  );

  return handleResponse<Emagazine>(response);
}

/* =========================================================
   UPDATE E-MAGAZINE STATUS
   PATCH /api/v1/emagazines/{id}/
========================================================= */

export async function updateEmagazineStatus(
  id: number,
  status: "draft" | "published",
): Promise<Emagazine> {
  const response = await fetch(
    `${API_BASE_URL}/emagazines/${id}/`,
    {
      method: "PATCH",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        status,
      }),
    },
  );

  return handleResponse<Emagazine>(response);
}

/* =========================================================
   DELETE E-MAGAZINE
   DELETE /api/v1/emagazines/{id}/
========================================================= */

export async function deleteEmagazine(
  id: number,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/emagazines/${id}/`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    await handleResponse<void>(response);
  }
}