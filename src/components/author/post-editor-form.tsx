"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { useAuth } from "@/providers/auth-provider";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

import { PostStatusBadge } from "@/components/shared/post-status-badge";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

import { categoriesApi } from "@/lib/api/categories";
import { mediaApi } from "@/lib/api/media";
import { postsApi } from "@/lib/api/posts";

import type { Post } from "@/types";


const postSchema = z.object({
  title: z.string().min(1, "Title is required"),

  slug: z.string().optional(),

  short_description: z
    .string()
    .max(500, "Summary must be less than 500 characters")
    .optional(),

  content: z.string().min(1, "Content is required"),

  category: z.number({
    error: "Select a category",
  }),

  seo_title: z.string().optional(),

  seo_description: z.string().optional(),


  video_url: z
    .string()
    .url("Enter a valid video URL")
    .or(z.literal(""))
    .optional(),
});


type PostFormValues = z.infer<typeof postSchema>;


export function PostEditorForm({
  existingPost,
}: {
  existingPost?: Post;
}) {
  const router = useRouter();
  const { isSuperAdmin } = useAuth();

  const isEditing = !!existingPost;

  const isLocked =
    isEditing &&
    !["draft", "changes_requested", "rejected"].includes(
      existingPost!.status
    );


  const [isSaving, setIsSaving] = useState(false);

  /*
   * Actual featured image URL.
   *
   * This can be:
   * - the R2 public URL returned after upload
   * - a manually entered public image URL
   */
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    existingPost?.featured_image_url ?? ""
  );

  /*
   * Manual "Paste Image URL" input.
   *
   * IMPORTANT:
   * This is intentionally separate from featuredImageUrl.
   * Therefore an R2 upload will NOT automatically appear
   * inside the manual URL textbox.
   */
  const [manualImageUrl, setManualImageUrl] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);

  const [imageError, setImageError] = useState("");

  const [imagePreviewError, setImagePreviewError] = useState(false);

  // ==============================
  // VIDEO
  // ==============================

  type PostWithVideo = Post & {
    video_url?: string;
  };

  const existingPostWithVideo = existingPost as PostWithVideo | undefined;

  const [videoUrl, setVideoUrl] = useState(
    existingPostWithVideo?.video_url ?? ""
  );

  const [videoFileName, setVideoFileName] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoError, setVideoError] = useState("");


  // ==============================
  // LOAD CATEGORIES
  // ==============================

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],

    queryFn: () => categoriesApi.list(),
  });


  // ==============================
  // FORM
  // ==============================

const {
  register,
  handleSubmit,
  watch,
  setValue,
  formState: { errors },
} = useForm<PostFormValues>({

    resolver: zodResolver(postSchema),

    defaultValues: existingPost
      ? {
          title: existingPost.title,

          short_description:
            existingPost.short_description ?? "",

          content: existingPost.content,

          category: existingPost.category.id,

          seo_title:
            existingPost.seo_title ?? "",

          seo_description:
            existingPost.seo_description ?? "",


          video_url:
            existingPostWithVideo?.video_url ?? "",
        }
      : {
          title: "",
          short_description: "",
          content: "",
          category: undefined as unknown as number,
          seo_title: "",
          seo_description: "",
          video_url: "",
        },
  });


  // ==============================
  // RICH TEXT EDITOR
  // ==============================

register("content");

const contentValue = watch("content") ?? "";


  // ==============================
  // IMAGE UPLOAD TO R2
  // ==============================

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploadingImage(true);
    setImageError("");
    setImagePreviewError(false);

    try {
      const media = await mediaApi.uploadImage(file);

      if (!media?.url) {
        throw new Error(
          "Image upload failed. No image URL was returned."
        );
      }

      /*
       * Store the actual R2 public URL for the featured image.
       */
      setFeaturedImageUrl(media.url);

      /*
       * IMPORTANT:
       * Do not put the uploaded R2 URL into the
       * manual "Paste Image URL" field.
       */
      setManualImageUrl("");

    } catch (error) {
      console.error(
        "Cloudflare R2 upload error:",
        error
      );

      setImageError(
        "Image upload to Cloudflare R2 failed. You can still paste an external image URL below."
      );
    } finally {
      setUploadingImage(false);

      /*
       * Allow selecting the same file again if needed.
       */
      e.target.value = "";
    }
  };


  // ==============================
  // EXTERNAL IMAGE URL
  // ==============================

  const handleImageUrlChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    /*
     * This field is only the manual URL input.
     */
    setManualImageUrl(value);

    /*
     * The manually entered URL becomes the actual
     * featured image URL used by the post.
     */
    setFeaturedImageUrl(value);

    setImageError("");

    setImagePreviewError(false);
  };


  // ==============================
  // REMOVE IMAGE
  // ==============================

  const removeFeaturedImage = () => {
    setFeaturedImageUrl("");
    setManualImageUrl("");

    setImageError("");

    setImagePreviewError(false);
  };


  // ==============================
  // VIDEO UPLOAD
  // ==============================

  const handleVideoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-m4v",
    ];

    if (!allowedVideoTypes.includes(file.type)) {
      setVideoError("Please select an MP4, WebM, or MOV video file.");
      e.target.value = "";
      return;
    }

    setUploadingVideo(true);
    setVideoError("");

    try {
      /*
       * The author uploads the source video here.
       * The admin will decide later whether the approved
       * video should be published to YouTube as unlisted.
       */
      const videoUploader = (mediaApi as typeof mediaApi & {
        uploadVideo?: (file: File) => Promise<{ url: string }>;
      }).uploadVideo;

      if (typeof videoUploader !== "function") {
        throw new Error(
          "Video upload is not configured yet. The backend R2 video upload API must be added."
        );
      }

      const media = await videoUploader(file);

      if (!media?.url) {
        throw new Error(
          "Video upload failed. No video reference was returned."
        );
      }

      setVideoUrl(media.url);
      setVideoFileName(file.name);

      setValue("video_url", media.url, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      console.error("Video upload error:", error);

      setVideoError(
        error instanceof Error
          ? error.message
          : "Video upload failed."
      );
    } finally {
      setUploadingVideo(false);
      e.target.value = "";
    }
  };


  const removeVideo = () => {
    setVideoUrl("");
    setVideoFileName("");
    setVideoError("");

    setValue("video_url", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };


  // ==============================
  // SAVE / SUBMIT POST
  // ==============================

  const saveAndMaybeSubmit = async (
    data: PostFormValues,
    submitAfter: boolean
  ) => {
    setIsSaving(true);

    try {
      const payload = {
        ...data,

        featured_image_url:
          featuredImageUrl.trim(),

        video_url:
          videoUrl.trim(),
      };


      const saved = isEditing
        ? await postsApi.update(
            existingPost!.id,
            payload
          )
        : await postsApi.create(payload);


      if (submitAfter) {
        await postsApi.submitForReview(saved.id);
      }


      router.push("/author/posts");

    } catch (error) {
      console.error(
        "Error saving post:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to save the post. Please check your details and try again."
      );

    } finally {
      setIsSaving(false);
    }
  };


  return (
    <>
      {!isEditing && isSuperAdmin && (
        <div className="mb-4 flex justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href="/author/posts/bulk">Bulk Posts</Link>
          </Button>
        </div>
      )}

      <form className="grid gap-6 lg:grid-cols-[1fr_320px]">

      {/* ==============================
          LEFT SIDE
      ============================== */}

      <div className="space-y-6">


        {/* STATUS */}

        {isEditing && (
          <div className="flex items-center gap-2">

            <span className="text-sm text-muted-foreground">
              Status:
            </span>

            <PostStatusBadge
              status={existingPost!.status}
            />

          </div>
        )}


        {/* ADMIN FEEDBACK */}

        {existingPost?.review_note && (
          <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-900">

            <strong>
              Admin feedback:
            </strong>

            {" "}

            {existingPost.review_note}

          </div>
        )}


        {/* LOCK MESSAGE */}

        {isLocked && (
          <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">

            This post is{" "}

            {existingPost!.status.replace("_", " ")}

            {" "}and cannot be edited right now.

          </div>
        )}


        {/* ==============================
            MAIN POST DETAILS
        ============================== */}

        <Card>

          <CardContent className="space-y-4 pt-6">


            {/* ARTICLE TITLE */}

            <div className="space-y-1.5">

              <Label htmlFor="title">
                Article Title
              </Label>

              <Input
                id="title"
                disabled={isLocked}
                {...register("title")}
              />

              {errors.title && (
                <p className="text-xs text-destructive">

                  {errors.title.message}

                </p>
              )}

            </div>


            {/* SHORT DESCRIPTION */}

            <div className="space-y-1.5">

              <Label htmlFor="short_description">

                Short Summary / Excerpt

              </Label>

              <Textarea
                id="short_description"
                rows={2}
                disabled={isLocked}
                {...register("short_description")}
              />

              {errors.short_description && (
                <p className="text-xs text-destructive">

                  {errors.short_description.message}

                </p>
              )}

            </div>


            {/* ==============================
                FEATURED IMAGE
            ============================== */}

            <div className="space-y-4">

              <Label>
                Featured Image
              </Label>


              {/* IMAGE PREVIEW */}

              {featuredImageUrl &&
                !imagePreviewError && (

                <div className="space-y-2">

                  <div className="relative w-full max-w-md">

                    {/* eslint-disable-next-line @next/next/no-img-element */}

                    <img
                      src={featuredImageUrl}
                      alt="Featured image preview"
                      className="h-48 w-full rounded-md border object-cover"

                      onError={() => {
                        setImagePreviewError(true);
                      }}
                    />

                  </div>


                  {!isLocked && (

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeFeaturedImage}
                    >

                      Remove Image

                    </Button>

                  )}

                </div>

              )}


              {/* INVALID IMAGE URL */}

              {featuredImageUrl &&
                imagePreviewError && (

                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">

                  <p className="text-sm text-destructive">

                    The image URL could not be loaded.
                    Please check the URL or upload another image.

                  </p>

                </div>

              )}


              {/* UPLOAD IMAGE */}

              <div className="space-y-2">

                <Label
                  htmlFor="featured-image-upload"
                  className="text-sm"
                >

                  Upload Image

                </Label>

                <Input
                  id="featured-image-upload"

                  type="file"

                  accept="image/*"

                  disabled={
                    isLocked ||
                    uploadingImage ||
                    uploadingVideo
                  }

                  onChange={
                    handleImageUpload
                  }
                />


                {uploadingImage && (

                  <p className="text-xs text-muted-foreground">

                    Uploading image to Cloudflare R2...

                  </p>

                )}

              </div>


              {/* OR DIVIDER */}

              <div className="flex items-center gap-3">

                <div className="h-px flex-1 bg-border" />

                <span className="text-xs text-muted-foreground">

                  OR

                </span>

                <div className="h-px flex-1 bg-border" />

              </div>


              {/* PASTE IMAGE URL */}

              <div className="space-y-2">

                <Label
                  htmlFor="featured-image-url"
                  className="text-sm"
                >

                  Paste Image URL

                </Label>

                <Input
                  id="featured-image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"

                  /*
                   * IMPORTANT:
                   * This input is now completely independent
                   * from the R2 upload result.
                   */
                  value={manualImageUrl}

                  disabled={isLocked}

                  onChange={
                    handleImageUrlChange
                  }
                />

                <p className="text-xs text-muted-foreground">

                  Paste any public image URL here.
                  This can be used if Cloudflare R2 upload is unavailable.

                </p>

              </div>


              {/* UPLOAD ERROR */}

              {imageError && (

                <div className="rounded-md border border-amber-300 bg-amber-50 p-3">

                  <p className="text-sm text-amber-800">

                    {imageError}

                  </p>

                </div>

              )}

            </div>


            {/* ==============================
                VIDEO
            ============================== */}

            <div className="space-y-4">

              <div>
                <Label>
                  Video
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload a video with this article. The admin will review the
                  video and decide whether to publish it to the War of Justice
                  YouTube channel as an unlisted video after approval.
                </p>
              </div>


              {videoUrl && (
                <div className="rounded-md border bg-muted/20 p-3">

                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {videoFileName || "Video attached"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Video attached and will be available to the admin for review.
                      </p>
                    </div>

                    {!isLocked && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeVideo}
                      >
                        Remove Video
                      </Button>
                    )}
                  </div>

                </div>
              )}


              {!videoUrl && (
                <div className="space-y-2">

                  <Label
                    htmlFor="post-video-upload"
                    className="text-sm"
                  >
                    Upload Video
                  </Label>

                  <Input
                    id="post-video-upload"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                    disabled={
                      isLocked ||
                      uploadingVideo
                    }
                    onChange={handleVideoUpload}
                  />

                  <p className="text-xs text-muted-foreground">
                    Supported formats: MP4, WebM, MOV.
                  </p>

                  {uploadingVideo && (
                    <p className="text-xs text-muted-foreground">
                      Uploading video...
                    </p>
                  )}

                </div>
              )}


              {videoError && (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
                  <p className="text-sm text-amber-800">
                    {videoError}
                  </p>
                </div>
              )}


              {!videoUrl && !videoError && !uploadingVideo && (
                <p className="text-xs text-muted-foreground">
                  Video is optional. You can submit this article without a video.
                </p>
              )}

            </div>


            {/* ==============================
                ARTICLE CONTENT
            ============================== */}

            <div className="space-y-1.5">

              <Label htmlFor="content">

                Article Content

              </Label>

              <RichTextEditor
                value={contentValue}

                onChange={(html) =>

                  setValue(
                    "content",
                    html,
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    }
                  )

                }

                disabled={isLocked}
              />


              {errors.content && (

                <p className="text-xs text-destructive">

                  {errors.content.message}

                </p>

              )}

            </div>


          </CardContent>

        </Card>


        {/* ==============================
            SEO SECTION
        ============================== */}

        <Card>

          <CardContent className="space-y-4 pt-6">

            <p className="text-sm font-semibold">

              SEO

            </p>


            {/* SEO TITLE */}

            <div className="space-y-1.5">

              <Label htmlFor="seo_title">

                SEO Title

              </Label>

              <Input
                id="seo_title"

                disabled={isLocked}

                {...register("seo_title")}
              />

            </div>


            {/* SEO DESCRIPTION */}

            <div className="space-y-1.5">

              <Label htmlFor="seo_description">

                SEO Description

              </Label>

              <Textarea
                id="seo_description"

                rows={2}

                disabled={isLocked}

                {...register("seo_description")}
              />

            </div>


          </CardContent>

        </Card>


      </div>


      {/* ==============================
          RIGHT SIDE
      ============================== */}

      <div className="space-y-4">


        <Card>

          <CardContent className="space-y-4 pt-6">


            {/* CATEGORY */}

            <div className="space-y-1.5">

              <Label>

                Category

              </Label>


              <Select
                disabled={isLocked}

                defaultValue={
                  existingPost?.category?.id?.toString()
                }

                onValueChange={(value) =>

                  setValue(
                    "category",
                    Number(value),
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    }
                  )

                }
              >

                <SelectTrigger>

                  <SelectValue
                    placeholder="Select category"
                  />

                </SelectTrigger>


                <SelectContent>

                  {categories.map((category) => (

                    <SelectItem
                      key={category.id}

                      value={
                        category.id.toString()
                      }
                    >

                      {category.name}

                    </SelectItem>

                  ))}

                </SelectContent>

              </Select>


              {errors.category && (

                <p className="text-xs text-destructive">

                  {errors.category.message}

                </p>

              )}

            </div>


            {/* ==============================
                ACTION BUTTONS
            ============================== */}

            {!isLocked && (

              <div className="space-y-2 border-t pt-4">


                {/* SAVE DRAFT */}

                <Button
                  type="button"

                  variant="outline"

                  className="w-full"

                  disabled={
                    isSaving ||
                    uploadingImage ||
                    uploadingVideo
                  }

                  onClick={handleSubmit(
                    (data) =>
                      saveAndMaybeSubmit(
                        data,
                        false
                      )
                  )}
                >

                  {isSaving
                    ? "Saving..."
                    : "Save Draft"}

                </Button>


                {/* PREVIEW */}

                <Button
                  type="button"

                  variant="secondary"

                  className="w-full"

                  onClick={() => {

                    if (existingPost) {

                      window.open(
                        `/article/${existingPost.slug}`,
                        "_blank"
                      );

                    } else {

                      alert(
                        "Please save the post as a draft before previewing it."
                      );

                    }

                  }}
                >

                  Preview

                </Button>


                {/* SUBMIT FOR REVIEW */}

                <Button
                  type="button"

                  className="w-full"

                  disabled={
                    isSaving ||
                    uploadingImage ||
                    uploadingVideo
                  }

                  onClick={handleSubmit(
                    (data) =>
                      saveAndMaybeSubmit(
                        data,
                        true
                      )
                  )}
                >

                  {isSaving
                    ? "Submitting..."
                    : "Submit for Review"}

                </Button>


              </div>

            )}


          </CardContent>

        </Card>


      </div>


      </form>
    </>
  );
}