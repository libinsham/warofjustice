import { apiClient } from "./client";
import type { Media, Paginated, Video } from "@/types";

interface PresignResponse {
  upload_url: string;
  key: string;
  public_url: string;
}

export const mediaApi = {
  /**
   * Direct-to-R2 image upload:
   *
   * 1. Ask Django for a presigned R2 PUT URL.
   * 2. Upload the actual file directly to R2.
   * 3. Confirm the uploaded key with Django.
   * 4. IMPORTANT: use the public_url returned by the presign
   *    endpoint for the frontend image URL.
   */
  async uploadImage(file: File): Promise<Media> {
    const { data: presign } =
      await apiClient.post<PresignResponse>(
        "/dashboard/media/presign/",
        {
          file_name: file.name,
          content_type: file.type,
          size_bytes: file.size,
        },
      );

    if (!presign.upload_url) {
      throw new Error(
        "R2 upload URL was not returned by the server.",
      );
    }

    if (!presign.key) {
      throw new Error(
        "R2 object key was not returned by the server.",
      );
    }

    if (!presign.public_url) {
      throw new Error(
        "R2 public URL was not returned by the server.",
      );
    }

    /*
     * Upload directly to Cloudflare R2.
     */
    const uploadResponse = await fetch(
      presign.upload_url,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            file.type || "application/octet-stream",
        },
        body: file,
      },
    );

    if (!uploadResponse.ok) {
      const responseText =
        await uploadResponse.text().catch(() => "");

      throw new Error(
        `R2 upload failed (${uploadResponse.status}).${
          responseText
            ? ` ${responseText.slice(0, 300)}`
            : ""
        }`,
      );
    }

    /*
     * Tell Django that the R2 object now exists.
     */
    const { data: confirmed } =
      await apiClient.post<Media>(
        "/dashboard/media/confirm/",
        {
          key: presign.key,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        },
      );

    /*
     * IMPORTANT:
     *
     * Django's Media serializer may still return a local
     * /uploads/... URL. For the browser preview we must use
     * the R2 public URL returned by the presign endpoint.
     *
     * Do not discard the R2 URL.
     */
    return {
      ...confirmed,
      url: presign.public_url,
    };
  },

  async listMine(): Promise<Media[]> {
    const { data } =
      await apiClient.get<Paginated<Media>>(
        "/dashboard/media/",
      );

    return data.results;
  },

  async listAll(
    params: {
      search?: string;
      type?: "image" | "document";
    } = {},
  ): Promise<Media[]> {
    const { data } =
      await apiClient.get<Paginated<Media>>(
        "/admin/media/",
        { params },
      );

    return data.results;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(
      `/dashboard/media/${id}/`,
    );
  },

  // =========================================================
  // VIDEO — BUNNY STREAM
  // =========================================================

  /**
   * Creates a Bunny video slot via the backend, then uploads
   * directly to Bunny using the returned upload information.
   */
  async createVideoSlot(
    title: string,
  ): Promise<{
    video: Video;
    upload: Record<string, unknown>;
  }> {
    const { data } =
      await apiClient.post(
        "/dashboard/videos/create-slot/",
        { title },
      );

    return data;
  },

  async listMyVideos(): Promise<Video[]> {
    const { data } =
      await apiClient.get<Paginated<Video>>(
        "/dashboard/videos/",
      );

    return data.results;
  },
};