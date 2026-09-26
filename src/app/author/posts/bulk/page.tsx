"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Upload, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

import { categoriesApi } from "@/lib/api/categories";
import { mediaApi } from "@/lib/api/media";
import { postsApi } from "@/lib/api/posts";

type Category = {
  id: number;
  name: string;
};

type BulkPostDraft = {
  localId: string;
  title: string;
  short_description: string;
  content: string;
  category: number | undefined;
  seo_title: string;
  seo_description: string;
  featured_image_url: string;
  manual_image_url: string;
  videoFile: File | null;
  videoFileName: string;
  videoError: string;
  imageError: string;
  uploadingImage: boolean;
};

const POST_COUNTS = [1, 5, 10] as const;

type PostCount = (typeof POST_COUNTS)[number];

function createEmptyPost(): BulkPostDraft {
  return {
    localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: "",
    short_description: "",
    content: "",
    category: undefined,
    seo_title: "",
    seo_description: "",
    featured_image_url: "",
    manual_image_url: "",
    videoFile: null,
    videoFileName: "",
    videoError: "",
    imageError: "",
    uploadingImage: false,
  };
}

export default function BulkPostsPage() {
  const router = useRouter();
  const [count, setCount] = useState<PostCount>(1);
  const [posts, setPosts] = useState<BulkPostDraft[]>([createEmptyPost()]);
  const [isSaving, setIsSaving] = useState(false);
  const [bulkError, setBulkError] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
  });

  const typedCategories = categories as Category[];

  const canChangeCount = !isSaving;

  const updateCount = (nextCount: PostCount) => {
    setCount(nextCount);
    setBulkError("");

    setPosts((current) => {
      if (nextCount === current.length) return current;

      if (nextCount > current.length) {
        return [
          ...current,
          ...Array.from(
            { length: nextCount - current.length },
            createEmptyPost,
          ),
        ];
      }

      return current.slice(0, nextCount);
    });
  };

  const updatePost = (
    index: number,
    patch: Partial<BulkPostDraft>,
  ) => {
    setPosts((current) =>
      current.map((post, postIndex) =>
        postIndex === index ? { ...post, ...patch } : post,
      ),
    );
  };

  const removePost = (index: number) => {
    if (posts.length <= 1) return;

    const nextPosts = posts.filter((_, postIndex) => postIndex !== index);
    setPosts(nextPosts);
    setCount(nextPosts.length as PostCount);
  };

  const handleImageUpload = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    updatePost(index, {
      uploadingImage: true,
      imageError: "",
    });

    try {
      const media = await mediaApi.uploadImage(file);

      if (!media?.url) {
        throw new Error("Image upload failed. No image URL was returned.");
      }

      updatePost(index, {
        featured_image_url: media.url,
        manual_image_url: "",
        uploadingImage: false,
        imageError: "",
      });
    } catch (error) {
      updatePost(index, {
        uploadingImage: false,
        imageError:
          error instanceof Error
            ? error.message
            : "Image upload to Cloudflare R2 failed.",
      });
    }
  };

  const handleVideoSelect = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-m4v",
    ];

    if (!allowedVideoTypes.includes(file.type)) {
      updatePost(index, {
        videoFile: null,
        videoFileName: "",
        videoError: "Please select an MP4, WebM, or MOV video file.",
      });
      return;
    }

    updatePost(index, {
      videoFile: file,
      videoFileName: file.name,
      videoError: "",
    });
  };

  const validatePosts = () => {
    const missing: number[] = [];
    const videoPosts: number[] = [];

    posts.forEach((post, index) => {
      if (!post.title.trim() || !post.content.trim() || !post.category) {
        missing.push(index + 1);
      }

      if (post.videoFile) {
        videoPosts.push(index + 1);
      }
    });

    if (missing.length > 0) {
      throw new Error(
        `Complete Title, Article Content, and Category for Post ${missing.join(
          ", ",
        )}.`,
      );
    }

    return videoPosts;
  };

  const saveAll = async (submitAfter: boolean) => {
    setBulkError("");

    try {
      setIsSaving(true);

      const videoPosts = validatePosts();

      if (videoPosts.length > 0) {
        throw new Error(
          `Post ${videoPosts.join(
            ", ",
          )} contains a video. Video upload to the backend is not connected yet. Save/submit these video posts after the R2 + YouTube backend is configured.`,
        );
      }

      for (const post of posts) {
        const payload = {
          title: post.title.trim(),
          short_description: post.short_description.trim(),
          content: post.content,
          category: post.category as number,
          seo_title: post.seo_title.trim(),
          seo_description: post.seo_description.trim(),
          featured_image_url: post.featured_image_url.trim(),
          video_url: "",
        };

        const saved = await postsApi.create(payload);

        if (submitAfter) {
          await postsApi.submitForReview(saved.id);
        }
      }

      router.push("/author/posts");
    } catch (error) {
      console.error("Bulk post error:", error);
      setBulkError(
        error instanceof Error
          ? error.message
          : "Unable to save the bulk posts.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const filledCount = useMemo(
    () => posts.filter((post) => post.title.trim()).length,
    [posts],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bulk Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Prepare 1, 5, or 10 articles and submit them together for admin
            review.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/author/posts/new")}
          disabled={isSaving}
        >
          <Plus className="h-4 w-4" />
          Single Post
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label className="text-sm font-semibold">Number of Posts</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {POST_COUNTS.map((postCount) => (
                <Button
                  key={postCount}
                  type="button"
                  variant={count === postCount ? "default" : "outline"}
                  onClick={() => updateCount(postCount)}
                  disabled={!canChangeCount}
                >
                  {postCount}
                </Button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {filledCount} of {posts.length} posts have a title.
            </p>
          </div>
        </CardContent>
      </Card>

      {bulkError && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {bulkError}
        </div>
      )}

      <div className="space-y-6">
        {posts.map((post, index) => (
          <Card key={post.localId}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
              <CardTitle className="text-lg">Post {index + 1}</CardTitle>
              {posts.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => removePost(index)}
                  disabled={isSaving}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              )}
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <div className="space-y-1.5">
                <Label htmlFor={`bulk-title-${post.localId}`}>
                  Article Title
                </Label>
                <Input
                  id={`bulk-title-${post.localId}`}
                  value={post.title}
                  onChange={(event) =>
                    updatePost(index, { title: event.target.value })
                  }
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`bulk-summary-${post.localId}`}>
                  Short Summary / Excerpt
                </Label>
                <Textarea
                  id={`bulk-summary-${post.localId}`}
                  rows={3}
                  value={post.short_description}
                  onChange={(event) =>
                    updatePost(index, {
                      short_description: event.target.value,
                    })
                  }
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-4">
                <Label>Featured Image</Label>

                {post.featured_image_url && (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.featured_image_url}
                      alt={`Post ${index + 1} featured image preview`}
                      className="h-40 w-full max-w-md rounded-md border object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updatePost(index, {
                          featured_image_url: "",
                          manual_image_url: "",
                        })
                      }
                      disabled={isSaving}
                    >
                      Remove Image
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor={`bulk-image-upload-${post.localId}`}
                    className="text-sm"
                  >
                    Upload Image
                  </Label>
                  <Input
                    id={`bulk-image-upload-${post.localId}`}
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageUpload(index, event)}
                    disabled={isSaving || post.uploadingImage}
                  />
                  {post.uploadingImage && (
                    <p className="text-xs text-muted-foreground">
                      Uploading image to Cloudflare R2...
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor={`bulk-image-url-${post.localId}`}
                    className="text-sm"
                  >
                    Paste Image URL
                  </Label>
                  <Input
                    id={`bulk-image-url-${post.localId}`}
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={post.manual_image_url}
                    onChange={(event) =>
                      updatePost(index, {
                        manual_image_url: event.target.value,
                        featured_image_url: event.target.value,
                        imageError: "",
                      })
                    }
                    disabled={isSaving}
                  />
                </div>

                {post.imageError && (
                  <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                    {post.imageError}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Video</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Optional. Admin will review the attached video and decide
                    whether it should be published to YouTube as an unlisted
                    video after approval.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor={`bulk-video-${post.localId}`}
                    className="text-sm"
                  >
                    Upload Video
                  </Label>
                  <Input
                    id={`bulk-video-${post.localId}`}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                    onChange={(event) => handleVideoSelect(index, event)}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: MP4, WebM, MOV.
                  </p>

                  {post.videoFileName && (
                    <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-3 text-sm">
                      <Video className="h-4 w-4" />
                      <span className="truncate">{post.videoFileName}</span>
                    </div>
                  )}

                  {post.videoError && (
                    <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                      {post.videoError}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Article Content</Label>
                <RichTextEditor
                  value={post.content}
                  onChange={(html) => updatePost(index, { content: html })}
                  disabled={isSaving}
                  placeholder={`Write Post ${index + 1}...`}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`bulk-seo-title-${post.localId}`}>
                    SEO Title
                  </Label>
                  <Input
                    id={`bulk-seo-title-${post.localId}`}
                    value={post.seo_title}
                    onChange={(event) =>
                      updatePost(index, { seo_title: event.target.value })
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`bulk-category-${post.localId}`}>
                    Category
                  </Label>
                  <Select
                    value={post.category ? String(post.category) : undefined}
                    onValueChange={(value) =>
                      updatePost(index, { category: Number(value) })
                    }
                    disabled={isSaving}
                  >
                    <SelectTrigger id={`bulk-category-${post.localId}`}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {typedCategories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`bulk-seo-description-${post.localId}`}>
                  SEO Description
                </Label>
                <Textarea
                  id={`bulk-seo-description-${post.localId}`}
                  rows={3}
                  value={post.seo_description}
                  onChange={(event) =>
                    updatePost(index, {
                      seo_description: event.target.value,
                    })
                  }
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => saveAll(false)}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save All as Draft"}
          </Button>

          <Button
            type="button"
            onClick={() => saveAll(true)}
            disabled={isSaving}
          >
            {isSaving ? "Submitting..." : "Submit All for Review"}
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-center pb-6 text-xs text-muted-foreground">
        Video uploads in bulk are ready for the UI now; the R2 upload and
        YouTube approval workflow will be connected in the backend step.
      </div>
    </div>
  );
}
