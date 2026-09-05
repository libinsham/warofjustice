"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authApi } from "@/lib/api/auth";
import { mediaApi } from "@/lib/api/media";
import { useAuth } from "@/providers/auth-provider";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  bio: z.string().max(500).optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  website: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AuthorProfilePage() {
  const { user, refresh } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(user?.profile.avatar_url ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username ?? "",
      bio: user?.profile.bio ?? "",
      twitter: user?.profile.twitter ?? "",
      facebook: user?.profile.facebook ?? "",
      website: user?.profile.website ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        bio: user.profile.bio,
        twitter: user.profile.twitter,
        facebook: user.profile.facebook,
        website: user.profile.website,
      });
      setAvatarUrl(user.profile.avatar_url);
    }
  }, [user, reset]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const media = await mediaApi.uploadImage(file);
      setAvatarUrl(media.url);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    await authApi.updateProfile({ ...data, avatar_url: avatarUrl });
    await refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-bold">Profile</h2>

      <Card>
        <CardHeader><CardTitle className="text-sm">Public Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl} alt={user.username} />
                <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <Input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                {uploadingAvatar && <p className="mt-1 text-xs text-muted-foreground">Uploading…</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register("username")} />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user.email} disabled />
              <p className="text-xs text-muted-foreground">Email changes aren&apos;t supported yet.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={3} {...register("bio")} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="twitter">Twitter / X</Label>
                <Input id="twitter" placeholder="@username" {...register("twitter")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="facebook">Facebook</Label>
                <Input id="facebook" {...register("facebook")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input id="website" placeholder="https://" {...register("website")} />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {saved ? "Saved" : isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
