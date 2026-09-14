"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function AuthorSettingsPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState({
    onApproved: true,
    onRejected: true,
    onChangesRequested: true,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setServerError(null);
    setSuccess(false);
    try {
      await authApi.changePassword(data.currentPassword, data.newPassword);
      setSuccess(true);
      reset();
    } catch (err) {
      const detail = isAxiosError(err) ? err.response?.data?.detail : null;
      setServerError(detail ?? "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-bold">Settings</h2>

      <Card>
        <CardHeader><CardTitle className="text-sm">Change Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</div>
            )}
            {success && (
              <div className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">Password changed successfully.</div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" {...register("currentPassword")} />
              {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" {...register("newPassword")} />
              {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Changing…" : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Email Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {/* NOTE: these preferences aren't persisted to the backend yet —
              there's no per-user notification-settings endpoint. Wire this
              up once one exists; for now it's local UI state so the page
              isn't empty, but toggling it has no lasting effect. */}
          <label className="flex items-center justify-between text-sm">
            <span>Notify me when a post is approved</span>
            <input
              type="checkbox"
              checked={emailNotifications.onApproved}
              onChange={(e) => setEmailNotifications((v) => ({ ...v, onApproved: e.target.checked }))}
              className="h-4 w-4 rounded border-input"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Notify me when a post is rejected</span>
            <input
              type="checkbox"
              checked={emailNotifications.onRejected}
              onChange={(e) => setEmailNotifications((v) => ({ ...v, onRejected: e.target.checked }))}
              className="h-4 w-4 rounded border-input"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Notify me when changes are requested</span>
            <input
              type="checkbox"
              checked={emailNotifications.onChangesRequested}
              onChange={(e) => setEmailNotifications((v) => ({ ...v, onChangesRequested: e.target.checked }))}
              className="h-4 w-4 rounded border-input"
            />
          </label>
          <p className="pt-2 text-xs text-muted-foreground">
            These preferences aren&apos;t connected to a backend endpoint yet — see code comment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
