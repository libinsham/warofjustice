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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PostStatusBadge } from "@/components/shared/post-status-badge";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { categoriesApi } from "@/lib/api/categories";
import { mediaApi } from "@/lib/api/media";
import { postsApi } from "@/lib/api/posts";
import type { Post } from "@/types";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  short_description: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
  category: z.number({ error: "Select a category" }),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

export function PostEditorForm({ existingPost }: { existingPost?: Post }) {
  const router = useRouter();
  const isEditing = !!existingPost;
  const isLocked = isEditing && !["draft", "changes_requested", "rejected"].includes(existingPost!.status);

  const [isSaving, setIsSaving] = useState(false);
  const [featuredImageUrl, setFeaturedImageUrl] = useState(existingPost?.featured_image_url ?? "");
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: existingPost
      ? {
          title: existingPost.title,
          short_description: existingPost.short_description,
          content: existingPost.content,
          category: existingPost.category.id,
          seo_title: existingPost.seo_title,
          seo_description: existingPost.seo_description,
        }
      : { title: "", content: "", category: undefined as unknown as number },
  });

  // Tiptap isn't a native <input>, so it can't use RHF's register() spread
  // directly — register the field manually and push updates via setValue.
  register("content");

  const contentValue = watch("content") ?? "";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const media = await mediaApi.uploadImage(file);
      setFeaturedImageUrl(media.url);
    } finally {
      setUploadingImage(false);
    }
  };

  const saveAndMaybeSubmit = async (data: PostFormValues, submitAfter: boolean) => {
    setIsSaving(true);
    try {
      const payload = { ...data, featured_image_url: featuredImageUrl };
      const saved = isEditing
        ? await postsApi.update(existingPost!.id, payload)
        : await postsApi.create(payload);

      if (submitAfter) {
        await postsApi.submitForReview(saved.id);
      }
      router.push("/author/posts");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {isEditing && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <PostStatusBadge status={existingPost!.status} />
          </div>
        )}
        {existingPost?.review_note && (
          <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Admin feedback:</strong> {existingPost.review_note}
          </div>
        )}
        {isLocked && (
          <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
            This post is {existingPost!.status.replace("_", " ")} and can&apos;t be edited right now.
          </div>
        )}

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-1.5">
              <Label htmlFor="title">Article Title</Label>
              <Input id="title" disabled={isLocked} {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="short_description">Short Summary / Excerpt</Label>
              <Textarea id="short_description" rows={2} disabled={isLocked} {...register("short_description")} />
            </div>

            <div className="space-y-1.5">
              <Label>Featured Image</Label>
              <div className="flex items-center gap-3">
                {featuredImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featuredImageUrl} alt="Featured" className="h-16 w-24 rounded object-cover" />
                )}
                <Input type="file" accept="image/*" disabled={isLocked || uploadingImage} onChange={handleImageUpload} />
              </div>
              {uploadingImage && <p className="text-xs text-muted-foreground">Uploading to Cloudflare R2…</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content">Article Content</Label>
              <RichTextEditor
                value={contentValue}
                onChange={(html) => setValue("content", html, { shouldDirty: true, shouldValidate: true })}
                disabled={isLocked}
              />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm font-semibold">SEO</p>
            <div className="space-y-1.5">
              <Label htmlFor="seo_title">SEO Title</Label>
              <Input id="seo_title" disabled={isLocked} {...register("seo_title")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seo_description">SEO Description</Label>
              <Textarea id="seo_description" rows={2} disabled={isLocked} {...register("seo_description")} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                disabled={isLocked}
                defaultValue={existingPost?.category?.id?.toString()}
                onValueChange={(v) => setValue("category", Number(v), { shouldValidate: true })}
              >
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>

            {!isLocked && (
              <div className="space-y-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isSaving}
                  onClick={handleSubmit((data) => saveAndMaybeSubmit(data, false))}
                >
                  Save Draft
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => window.open(existingPost ? `/article/${existingPost.slug}` : "#", "_blank")}
                >
                  Preview
                </Button>
                <Button
                  type="button"
                  className="w-full"
                  disabled={isSaving}
                  onClick={handleSubmit((data) => saveAndMaybeSubmit(data, true))}
                >
                  Submit for Review
                </Button>
                {/* Deliberately no Publish button here — authors never
                    publish directly, per spec. The backend enforces this
                    independently too (PostWriteSerializer excludes `status`). */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
