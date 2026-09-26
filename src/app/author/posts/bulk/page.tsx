"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  Minus,
  Plus,
  Trash2,
  Video,
} from "lucide-react";

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
  isExpanded: boolean;
  scheduleEnabled: boolean;
  scheduledAt: string;
};

const POST_COUNTS = [1, 5, 10] as const;
type PostCount = (typeof POST_COUNTS)[number];

function createEmptyPost(isExpanded = true): BulkPostDraft {
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
    isExpanded,
    scheduleEnabled: false,
    scheduledAt: "",
  };
}

export default function BulkPostsPage() {
  const router = useRouter();
  const [count, setCount] = useState<PostCount>(1);
  const [posts, setPosts] = useState<BulkPostDraft[]>([
    createEmptyPost(true),
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [bulkError, setBulkError] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
  });

  const typedCategories = categories as Category[];

  const expandedPosts = useMemo(
    () => posts.filter((post) => post.isExpanded),
    [posts],
  );

  const collapsedPosts = useMemo(
    () => posts.filter((post) => !post.isExpanded),
    [posts],
  );

  const expandedCount = expandedPosts.length;

  const updateCount = (nextCount: PostCount) => {
    if (isSaving) return;

    setCount(nextCount);
    setBulkError("");

    setPosts((current) => {
      if (nextCount === current.length) return current;

      if (nextCount > current.length) {
        return [
          ...current,
          ...Array.from(
            { length: nextCount - current.length },
            () => createEmptyPost(true),
          ),
        ];
      }

      return current.slice(0, nextCount);
    });
  };

  const updatePost = (
    localId: string,
    patch: Partial<BulkPostDraft>,
  ) => {
    setPosts((current) =>
      current.map((post) =>
        post.localId === localId ? { ...post, ...patch } : post,
      ),
    );
  };

  const togglePostExpanded = (localId: string) => {
    if (isSaving) return;

    setPosts((current) =>
      current.map((post) =>
        post.localId === localId
          ? { ...post, isExpanded: !post.isExpanded }
          : post,
      ),
    );
  };

  const removePost = (localId: string) => {
    if (posts.length <= 1 || isSaving) return;

    setPosts((current) => current.filter((post) => post.localId !== localId));
    setBulkError("");
  };

  const handleImageUpload = async (
    localId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    updatePost(localId, {
      uploadingImage: true,
      imageError: "",
    });

    try {
      const media = await mediaApi.uploadImage(file);

      if (!media?.url) {
        throw new Error("Image upload failed. No image URL was returned.");
      }

      updatePost(localId, {
        featured_image_url: media.url,
        manual_image_url: "",
        uploadingImage: false,
        imageError: "",
      });
    } catch (error) {
      updatePost(localId, {
        uploadingImage: false,
        imageError:
          error instanceof Error
            ? error.message
            : "Image upload to Cloudflare R2 failed.",
      });
    }
  };

  const handleVideoSelect = (
    localId: string,
    event: ChangeEvent<HTMLInputElement>,
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
      updatePost(localId, {
        videoFile: null,
        videoFileName: "",
        videoError: "Please select an MP4, WebM, or MOV video file.",
      });
      return;
    }

    updatePost(localId, {
      videoFile: file,
      videoFileName: file.name,
      videoError: "",
    });
  };

  const clearVideo = (localId: string) => {
    updatePost(localId, {
      videoFile: null,
      videoFileName: "",
      videoError: "",
    });
  };

  const validatePosts = () => {
    const missing: number[] = [];
    const videoPosts: number[] = [];
    const invalidSchedules: number[] = [];

    posts.forEach((post, index) => {
      if (!post.title.trim() || !post.content.trim() || !post.category) {
        missing.push(index + 1);
      }

      if (post.videoFile) {
        videoPosts.push(index + 1);
      }

      if (post.scheduleEnabled) {
        if (!post.scheduledAt) {
          invalidSchedules.push(index + 1);
        } else {
          const scheduled = new Date(post.scheduledAt);
          if (Number.isNaN(scheduled.getTime()) || scheduled <= new Date()) {
            invalidSchedules.push(index + 1);
          }
        }
      }
    });

    if (missing.length > 0) {
      throw new Error(
        `Complete Title, Article Content, and Category for Post ${missing.join(
          ", ",
        )}.`,
      );
    }

    if (invalidSchedules.length > 0) {
      throw new Error(
        `Enter a future publish date and time for Post ${invalidSchedules.join(
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
          )} contains a video. Video upload to the backend is not connected yet. Finish the R2 + admin/YouTube backend before submitting video posts.`,
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
          scheduled_at: post.scheduleEnabled
            ? new Date(post.scheduledAt).toISOString()
            : null,
          schedule_enabled: post.scheduleEnabled,
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

  const columnCount = Math.max(1, expandedCount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bulk Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Prepare 1, 5, or 10 articles. Expand only the posts you are editing.
            Open posts automatically share the available width.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/author/posts/new")}
          disabled={isSaving}
        >
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
                  disabled={isSaving}
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

      {/*
       * Desktop layout:
       * 1 open  = 100%
       * 2 open  = 50% / 50%
       * 3 open  = 33.33% each
       * 4 open  = 25% each
       * 5 open  = 20% each
       *
       * Collapsed posts are removed from this editing grid and placed
       * into a separate compact row below. This keeps the open columns
       * evenly sized and prevents collapsed posts from consuming space.
       */}
      <div
        className="hidden gap-6 lg:grid"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        }}
      >
        {expandedPosts.map((post) => {
          const index = posts.findIndex((item) => item.localId === post.localId);
          return renderPostCard({
            post,
            index,
            categories: typedCategories,
            isSaving,
            onToggle: togglePostExpanded,
            onRemove: removePost,
            onUpdate: updatePost,
            onImageUpload: handleImageUpload,
            onVideoSelect: handleVideoSelect,
            onClearVideo: clearVideo,
          });
        })}
      </div>

      {/* Mobile / tablet: one column for readability. */}
      <div className="grid grid-cols-1 gap-6 lg:hidden">
        {posts.map((post) => {
          const index = posts.findIndex((item) => item.localId === post.localId);
          return renderPostCard({
            post,
            index,
            categories: typedCategories,
            isSaving,
            onToggle: togglePostExpanded,
            onRemove: removePost,
            onUpdate: updatePost,
            onImageUpload: handleImageUpload,
            onVideoSelect: handleVideoSelect,
            onClearVideo: clearVideo,
          });
        })}
      </div>

      {collapsedPosts.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Collapsed Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {collapsedPosts.map((post) => {
              const index = posts.findIndex((item) => item.localId === post.localId);

              return (
                <div
                  key={post.localId}
                  className="flex items-center justify-between gap-3 rounded-md border bg-muted/20 p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Post {index + 1}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {post.title.trim() || "No title entered"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => togglePostExpanded(post.localId)}
                      disabled={isSaving}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Open
                    </Button>

                    {posts.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removePost(post.localId)}
                        disabled={isSaving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

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

      <div className="pb-6 text-center text-xs text-muted-foreground">
        Open posts share the desktop width equally. Collapsing a post removes it
        from the editing grid and moves it into the collapsed section. Click + / Open
        to bring it back into the equal-width columns. Scheduled publishing is
        prepared in the frontend and will be enforced by the backend later.
      </div>
    </div>
  );
}

type RenderPostCardArgs = {
  post: BulkPostDraft;
  index: number;
  categories: Category[];
  isSaving: boolean;
  onToggle: (localId: string) => void;
  onRemove: (localId: string) => void;
  onUpdate: (localId: string, patch: Partial<BulkPostDraft>) => void;
  onImageUpload: (
    localId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  onVideoSelect: (
    localId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  onClearVideo: (localId: string) => void;
};

function renderPostCard({
  post,
  index,
  categories,
  isSaving,
  onToggle,
  onRemove,
  onUpdate,
  onImageUpload,
  onVideoSelect,
  onClearVideo,
}: RenderPostCardArgs) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onToggle(post.localId)}
            disabled={isSaving}
            aria-label={`Collapse Post ${index + 1}`}
            title="Collapse"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <div className="min-w-0">
            <CardTitle className="text-lg">Post {index + 1}</CardTitle>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {post.title.trim() || "Untitled post"}
            </p>
          </div>
        </div>

        {postsCanBeRemoved && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-destructive"
            onClick={() => onRemove(post.localId)}
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
              onUpdate(post.localId, { title: event.target.value })
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
              onUpdate(post.localId, {
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
                  onUpdate(post.localId, {
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
              onChange={(event) => onImageUpload(post.localId, event)}
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
                onUpdate(post.localId, {
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
              Optional. Admin will review the attached video and decide whether
              it should be published to YouTube as an unlisted video after approval.
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
              onChange={(event) => onVideoSelect(post.localId, event)}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: MP4, WebM, MOV.
            </p>

            {post.videoFileName && (
              <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 p-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <Video className="h-4 w-4 shrink-0" />
                  <span className="truncate">{post.videoFileName}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => onClearVideo(post.localId)}
                  disabled={isSaving}
                >
                  Remove
                </Button>
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
            onChange={(html) => onUpdate(post.localId, { content: html })}
            disabled={isSaving}
            placeholder={`Write Post ${index + 1}...`}
          />
        </div>

        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor={`bulk-category-${post.localId}`}>
              Category
            </Label>
            <Select
              value={post.category ? String(post.category) : undefined}
              onValueChange={(value) =>
                onUpdate(post.localId, { category: Number(value) })
              }
              disabled={isSaving}
            >
              <SelectTrigger id={`bulk-category-${post.localId}`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
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

          <div className="space-y-1.5">
            <Label htmlFor={`bulk-seo-title-${post.localId}`}>
              SEO Title
            </Label>
            <Input
              id={`bulk-seo-title-${post.localId}`}
              value={post.seo_title}
              onChange={(event) =>
                onUpdate(post.localId, { seo_title: event.target.value })
              }
              disabled={isSaving}
            />
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
                onUpdate(post.localId, {
                  seo_description: event.target.value,
                })
              }
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="rounded-md border bg-muted/20 p-4">
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="text-sm font-semibold">Publish Schedule</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Optional. Choose a future date and time for this post. Admin
                  approval is still required before publishing.
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={post.scheduleEnabled}
                  onChange={(event) =>
                    onUpdate(post.localId, {
                      scheduleEnabled: event.target.checked,
                      scheduledAt: event.target.checked
                        ? post.scheduledAt
                        : "",
                    })
                  }
                  disabled={isSaving}
                  className="h-4 w-4 rounded border-input"
                />
                Schedule this post
              </label>

              {post.scheduleEnabled && (
                <div className="space-y-2">
                  <Label htmlFor={`bulk-scheduled-at-${post.localId}`}>
                    Publish Date & Time
                  </Label>
                  <Input
                    id={`bulk-scheduled-at-${post.localId}`}
                    type="datetime-local"
                    value={post.scheduledAt}
                    onChange={(event) =>
                      onUpdate(post.localId, {
                        scheduledAt: event.target.value,
                      })
                    }
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground">
                    Time is based on the author's browser/local timezone.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Kept outside renderPostCard so the card remains easy to read and the
// remove button can be enabled/disabled consistently by the parent.
const postsCanBeRemoved = true;
