 "use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  UserCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, type User, type UpdateProfilePayload } from "@/lib/api/auth";

export default function SubscriberProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<UpdateProfilePayload>({
    username: "",
    bio: "",
    avatar_url: "",
    twitter: "",
    facebook: "",
    website: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        const data = await authApi.me();

        if (cancelled) return;

        setUser(data);
        setForm({
          username: data.username ?? "",
          bio: data.profile?.bio ?? "",
          avatar_url: data.profile?.avatar_url ?? "",
          twitter: data.profile?.twitter ?? "",
          facebook: data.profile?.facebook ?? "",
          website: data.profile?.website ?? "",
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your profile.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(
    field: keyof UpdateProfilePayload,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setSuccess(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updated = await authApi.updateProfile({
        username: form.username?.trim(),
        bio: form.bio ?? "",
        avatar_url: form.avatar_url ?? "",
        twitter: form.twitter ?? "",
        facebook: form.facebook ?? "",
        website: form.website ?? "",
      });

      setUser(updated);

      setForm({
        username: updated.username ?? "",
        bio: updated.profile?.bio ?? "",
        avatar_url: updated.profile?.avatar_url ?? "",
        twitter: updated.profile?.twitter ?? "",
        facebook: updated.profile?.facebook ?? "",
        website: updated.profile?.website ?? "",
      });

      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  const fullName = user?.profile?.full_name || "Subscriber";
  const applicationId =
    user?.subscriber_application?.application_id || "—";
  const status = user?.status || "active";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/subscriber/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700">
              <UserCircle2 className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                My Profile
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                View and update your subscriber profile information.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-red-700" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  Profile Information
                </CardTitle>
              </CardHeader>

              <CardContent>
                {error && (
                  <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={fullName}
                        readOnly
                        className="bg-slate-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={user?.email ?? ""}
                        readOnly
                        className="bg-slate-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        value={user?.profile?.phone_number ?? ""}
                        readOnly
                        className="bg-slate-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>WhatsApp Number</Label>
                      <Input
                        value={user?.profile?.whatsapp_number ?? ""}
                        readOnly
                        className="bg-slate-50"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={form.username ?? ""}
                        onChange={(event) =>
                          updateField("username", event.target.value)
                        }
                        minLength={3}
                        required
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        value={form.bio ?? ""}
                        onChange={(event) =>
                          updateField("bio", event.target.value)
                        }
                        rows={5}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-red-600"
                        placeholder="Tell us a little about yourself"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="avatar_url">Avatar URL</Label>
                      <Input
                        id="avatar_url"
                        type="url"
                        value={form.avatar_url ?? ""}
                        onChange={(event) =>
                          updateField("avatar_url", event.target.value)
                        }
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={form.twitter ?? ""}
                        onChange={(event) =>
                          updateField("twitter", event.target.value)
                        }
                        placeholder="@username or profile URL"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={form.facebook ?? ""}
                        onChange={(event) =>
                          updateField("facebook", event.target.value)
                        }
                        placeholder="Profile URL"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={form.website ?? ""}
                        onChange={(event) =>
                          updateField("website", event.target.value)
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-red-700 hover:bg-red-800"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="h-fit border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  Subscriber Account
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Subscriber / Application ID
                  </p>
                  <p className="mt-2 text-xl font-bold text-slate-950">
                    {applicationId}
                  </p>
                </div>

                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Account Status
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-lg font-bold text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Account Role
                  </p>
                  <p className="mt-2 font-semibold text-slate-950">
                    {user?.role?.label || user?.role?.name || "Subscriber"}
                  </p>
                </div>

                <Link
                  href="/subscriber/settings"
                  className="block rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Open Account Settings
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
