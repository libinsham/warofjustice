import { apiClient } from "./client";
import type { Media, Paginated, Video } from "@/types";

interface PresignResponse {
  upload_url: string;
  key: string;
  public_url: string;
}

export const mediaApi = {
  /**
   * Full direct-to-R2 upload flow: presign -> PUT the file straight to
   * Cloudflare R2 -> confirm with the backend. The file bytes never pass
   * through Django, matching the "large files never touch the app
   * server" requirement.
   */
  async uploadImage(file: File): Promise<Media> {
    const { data: presign } = await apiClient.post<PresignResponse>("/dashboard/media/presign/", {
      file_name: file.name,
      content_type: file.type,
      size_bytes: file.size,
    });

    // Bare fetch, not apiClient — this goes straight to Cloudflare R2, not our API.
    await fetch(presign.upload_url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    const { data: confirmed } = await apiClient.post<Media>("/dashboard/media/confirm/", {
      key: presign.key,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    });

    return confirmed;
  },

  async listMine(): Promise<Media[]> {
    const { data } = await apiClient.get<Paginated<Media>>("/dashboard/media/");
    return data.results;
  },

  async listAll(params: { search?: string; type?: "image" | "document" } = {}): Promise<Media[]> {
    const { data } = await apiClient.get<Paginated<Media>>("/admin/media/", { params });
    return data.results;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/dashboard/media/${id}/`);
  },

  // ---- Video (Bunny Stream) ----

  /**
   * Creates a Bunny video slot via the backend, then uploads the file
   * directly to Bunny using TUS (resumable upload) with the returned
   * signature — the Bunny API key never reaches the browser.
   */
  async createVideoSlot(title: string): Promise<{ video: Video; upload: Record<string, unknown> }> {
    const { data } = await apiClient.post("/dashboard/videos/create-slot/", { title });
    return data;
  },

  async listMyVideos(): Promise<Video[]> {
    const { data } = await apiClient.get<Paginated<Video>>("/dashboard/videos/");
    return data.results;
  },
};
