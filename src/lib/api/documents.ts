import { TokenStore } from "@/lib/token-storage";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export type DocumentType = "id_card" | "certificate";

export interface MemberDocument {
  document_number: string;
  document_type: DocumentType;
  document_type_display: string;
  status: string;
  status_display: string;
  version: number;
  template_version: string;
  issue_date: string | null;
  expiry_date: string | null;
  verification_url: string | null;
  has_pdf: boolean;
}

export interface DocumentsResponse {
  results: MemberDocument[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
 const token = TokenStore.getAccess();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const data = await response.json();

      if (typeof data?.detail === "string") {
        message = data.detail;
      }
    } catch {
      // Ignore invalid JSON error responses.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function getMyDocuments(): Promise<MemberDocument[]> {
  const data = await request<MemberDocument[] | DocumentsResponse>(
    "/documents/my/",
  );

  if (Array.isArray(data)) {
    return data;
  }

  return data.results ?? [];
}

export async function getMyDocument(
  documentNumber: string,
): Promise<MemberDocument> {
  return request<MemberDocument>(
    `/documents/my/${encodeURIComponent(documentNumber)}/`,
  );
}

export async function getDocumentDownloadUrl(
  documentNumber: string,
): Promise<string> {
  const data = await request<{ url: string }>(
    `/documents/my/${encodeURIComponent(documentNumber)}/download/`,
  );

  return data.url;
}