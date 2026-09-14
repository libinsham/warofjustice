"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

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
});


type PostFormValues = z.infer<typeof postSchema>;


export function PostEditorForm({
  existingPost,
}: {
  existingPost?: Post;
}) {
  const router = useRouter();

  const isEditing = !!existingPost;

  const isLocked =
    isEditing &&
    !["draft", "changes_requested", "rejected"].includes(
      existingPost!.status
    );


  const [isSaving, setIsSaving] = useState(false);

  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    existingPost?.featured_image_url ?? ""
  );

  const [uploadingImage, setUploadingImage] = useState(false);

  const [imageError, setImageError] = useState("");

  const [imagePreviewError, setImagePreviewError] = useState(false);


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
        }
      : {
          title: "",
          short_description: "",
          content: "",
          category: undefined as unknown as number,
          seo_title: "",
          seo_description: "",
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
        throw new Error("Image upload failed. No image URL was returned.");
      }

      setFeaturedImageUrl(media.url);
    } catch (error) {
      console.error("Cloudflare R2 upload error:", error);

      setImageError(
        "Image upload to Cloudflare R2 failed. You can still paste an external image URL below."
      );
    } finally {
      setUploadingImage(false);

      // Allow selecting the same file again if needed
      e.target.value = "";
    }
  };


  // ==============================
  // EXTERNAL IMAGE URL
  // ==============================

  const handleImageUrlChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFeaturedImageUrl(e.target.value);

    setImageError("");

    setImagePreviewError(false);
  };


  // ==============================
  // REMOVE IMAGE
  // ==============================

  const removeFeaturedImage = () => {
    setFeaturedImageUrl("");

    setImageError("");

    setImagePreviewError(false);
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

        featured_image_url: featuredImageUrl.trim(),
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
      console.error("Error saving post:", error);

      alert(
        "Unable to save the post. Please check your details and try again."
      );
    } finally {
      setIsSaving(false);
    }
  };


  return (
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
                    uploadingImage
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

                  value={featuredImageUrl}

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
                    uploadingImage
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
                    uploadingImage
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
  );
}