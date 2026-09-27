
import { apiClient } from "./client";
import type { Media, Paginated } from "@/types";

interface ImagePresignResponse {
  upload_url: string;
  key: string;
  public_url: string;
}

interface VideoPresignResponse {
  upload_url: string;
  key: string;
  expires_in: number;
}

export interface R2Video {
  id: number;
  title: string;
  bunny_video_id: string | null;
  thumbnail_url: string;
  playback_url: string;
  duration_seconds: number | null;
  r2_key: string | null;
  file_name: string;
  mime_type: string;
  size_bytes: number | null;
  status: string;
  url: string | null;
  created_at: string;
}

interface VideoDownloadResponse {
  download_url: string;
  expires_in: number;
}

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
];

const MAX_VIDEO_SIZE_BYTES = 5 * 1024 * 1024 * 1024;

export const mediaApi = {
  // IMAGE UPLOAD TO CLOUDFLARE R2

  async uploadImage(file: File): Promise<Media> {
    const { data: presign } =
      await apiClient.post<ImagePresignResponse>(
        "/dashboard/media/presign/",
        {
          file_name: file.name,
          content_type: file.type || "application/octet-stream",
          size_bytes: file.size,
        },
      );

    if (!presign?.upload_url || !presign?.key || !presign?.public_url) {
      throw new Error("Image upload could not be initialized.");
    }

    const uploadResponse = await fetch(presign.upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(
        `Cloudflare R2 image upload failed (${uploadResponse.status}).`,
      );
    }

    const { data: confirmed } = await apiClient.post<Media>(
      "/dashboard/media/confirm/",
      {
        key: presign.key,
        file_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
      },
    );

    if (!confirmed) {
      throw new Error("Image upload confirmation failed.");
    }

    return {
      ...confirmed,
      url: presign.public_url,
    };
  },

  // VIDEO UPLOAD TO CLOUDFLARE R2

  async uploadVideo(
    file: File,
    title: string = "",
  ): Promise<R2Video> {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      throw new Error(
        "Please select an MP4, WebM, or MOV video file.",
      );
    }

    if (file.size < 1 || file.size > MAX_VIDEO_SIZE_BYTES) {
      throw new Error(
        "Video size must be greater than 0 and no larger than 5 GiB.",
      );
    }

    const videoTitle = title.trim() || file.name;

    // Step 1: Request a temporary R2 upload URL.
    const { data: presign } =
      await apiClient.post<VideoPresignResponse>(
        "/dashboard/videos/presign/",
        {
          title: videoTitle,
          file_name: file.name,
          content_type: file.type,
          size_bytes: file.size,
        },
      );

    if (!presign?.upload_url || !presign?.key) {
      throw new Error("Video upload could not be initialized.");
    }

    // Step 2: Upload the original video directly to R2.
    const uploadResponse = await fetch(presign.upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(
        `Cloudflare R2 video upload failed (${uploadResponse.status}).`,
      );
    }

    // Step 3: Confirm the upload with Django.
    const { data: video } = await apiClient.post<R2Video>(
      "/dashboard/videos/confirm/",
      {
        key: presign.key,
        title: videoTitle,
        file_name: file.name,
        content_type: file.type,
        size_bytes: file.size,
      },
    );

    if (!video?.id || !video?.url) {
      throw new Error(
        "Video was uploaded, but confirmation did not return a video reference.",
      );
    }

    return video;
  },

  // MY VIDEOS

  async listMyVideos(): Promise<Paginated<R2Video>> {
    const { data } = await apiClient.get<Paginated<R2Video>>(
      "/dashboard/videos/",
    );

    return data;
  },

  // ADMIN VIDEO DOWNLOAD

  async getVideoDownloadUrl(id: number): Promise<string> {
    const { data } = await apiClient.get<VideoDownloadResponse>(
      `/admin/videos/${id}/download/`,
    );

    if (!data?.download_url) {
      throw new Error("No video download URL was returned.");
    }

    return data.download_url;
  },

  // MY MEDIA

  async listMine(page?: number): Promise<Paginated<Media>> {
    const { data } = await apiClient.get<Paginated<Media>>(
      "/dashboard/media/",
      {
        params: page ? { page } : undefined,
      },
    );

    return data;
  },

  // ALL MEDIA

  async listAll(page?: number): Promise<Paginated<Media>> {
    const { data } = await apiClient.get<Paginated<Media>>(
      "/dashboard/media/",
      {
        params: page ? { page } : undefined,
      },
    );

    return data;
  },

  // DELETE MEDIA

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/dashboard/media/${id}/`);
  },
};