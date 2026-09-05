"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!uid || !token) {
      setServerError("This reset link is invalid or incomplete.");
      return;
    }
    setServerError(null);
    try {
      await authApi.resetPassword(uid, token, data.password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      const detail = isAxiosError(err) ? err.response?.data?.detail : null;
      setServerError(detail ?? "This reset link is invalid or has expired.");
    }
  };

  if (!uid || !token) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        This reset link is missing required information. Please request a new one from{" "}
        <Link href="/forgot-password" className="font-semibold underline">the forgot password page</Link>.
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-md bg-primary/10 p-4 text-sm text-primary">
        Password reset — redirecting you to sign in…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="password">New Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Resetting…" : "Reset Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-black">Reset your password</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose a new password for your account.</p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
