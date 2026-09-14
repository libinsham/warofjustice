"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useForm,
} from "react-hook-form";
import {
  zodResolver,
} from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { isAxiosError } from "axios";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth-provider";
import { SITE_NAME } from "@/lib/site-config";

/* ==========================================================================
   LOGIN SCHEMA
   ========================================================================== */

const loginSchema = z.object({
  email: z
    .string()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),

  remember: z
    .boolean()
    .optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

type LoginMode =
  | "subscriber"
  | "member";

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [mode, setMode] =
    useState<LoginMode>(
      "subscriber",
    );

  const [serverError, setServerError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const [showPassword, setShowPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginForm>({
    resolver:
      zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  /* ==========================================================================
     CHANGE LOGIN TYPE
     ========================================================================== */

  const changeMode = (
    nextMode: LoginMode,
  ) => {
    setMode(nextMode);
    setServerError(null);
    setSuccessMessage(null);
  };

  /* ==========================================================================
     LOGIN
     ========================================================================== */

  const onSubmit = async (
    data: LoginForm,
  ) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      await login(
        data.email,
        data.password,
      );

      setSuccessMessage(
        "Sign in successful. Redirecting...",
      );

      router.push("/");
    } catch (err) {
      const detail = isAxiosError(err)
        ? err.response?.data?.detail
        : null;

      setServerError(
        detail ??
          "Invalid email or password.",
      );
    }
  };

  /* ==========================================================================
     RENDER
     ========================================================================== */

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-white to-gray-50 px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">

        {/* ================================================================
            PAGE HEADER
            ================================================================ */}

        <div className="mb-7 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-red-700">
            {SITE_NAME}
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            Sign in to {SITE_NAME}
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Welcome back — enter your
            details below.
          </p>
        </div>

        {/* ================================================================
            ALWAYS-VISIBLE SELECTOR
            ================================================================ */}

        <div className="mx-auto mb-7 w-full max-w-xl">
          <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1.5 shadow-sm ring-1 ring-gray-200">

            <button
              type="button"
              onClick={() =>
                changeMode(
                  "subscriber",
                )
              }
              className={`rounded-lg px-4 py-3 text-sm font-bold transition-all ${
                mode ===
                "subscriber"
                  ? "bg-red-700 text-white shadow-md"
                  : "text-gray-600 hover:bg-white hover:text-gray-900"
              }`}
            >
              Subscriber
            </button>

            <button
              type="button"
              onClick={() =>
                changeMode(
                  "member",
                )
              }
              className={`rounded-lg px-4 py-3 text-sm font-bold transition-all ${
                mode ===
                "member"
                  ? "bg-red-700 text-white shadow-md"
                  : "text-gray-600 hover:bg-white hover:text-gray-900"
              }`}
            >
              Member / Contributor
            </button>

          </div>
        </div>

        {/* ================================================================
            LOGIN CARD
            ================================================================ */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* CARD HEADER */}

          <div className="bg-gradient-to-r from-red-800 to-red-700 px-6 py-6 text-white sm:px-8">
            <div className="flex items-start gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                <LogIn className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.17em] text-red-100">
                  {mode ===
                  "subscriber"
                    ? "SUBSCRIBER LOGIN"
                    : "MEMBER / CONTRIBUTOR LOGIN"}
                </p>

                <h2 className="mt-1 text-xl font-black sm:text-2xl">
                  {mode ===
                  "subscriber"
                    ? "Subscriber Sign In"
                    : "Member / Contributor Sign In"}
                </h2>

                <p className="mt-1 text-xs leading-5 text-red-100">
                  {mode ===
                  "subscriber"
                    ? "Access your War of Justice subscriber account."
                    : "Sign in to your approved member or contributor account."}
                </p>
              </div>

            </div>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit(
              onSubmit,
            )}
            className="space-y-6 p-6 sm:p-8"
          >

            {/* ERROR */}

            {serverError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {serverError}
              </div>
            )}

            {/* SUCCESS */}

            {successMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {successMessage}
              </div>
            )}

            {/* EMAIL */}

            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="Enter your email address"
                {...register("email")}
                aria-invalid={
                  !!errors.email
                }
              />

              {errors.email && (
                <p className="text-xs font-medium text-red-600">
                  {
                    errors.email
                      .message
                  }
                </p>
              )}
            </div>

            {/* PASSWORD */}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  Password
                </Label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-red-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="pr-11"
                  {...register(
                    "password",
                  )}
                  aria-invalid={
                    !!errors.password
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) =>
                        !value,
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-xs font-medium text-red-600">
                  {
                    errors.password
                      .message
                  }
                </p>
              )}
            </div>

            {/* REMEMBER */}

            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-500">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 accent-red-700"
                {...register(
                  "remember",
                )}
              />

              <span>
                Remember me
              </span>
            </label>

            {/* SIGN IN */}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full bg-red-700 text-sm font-black hover:bg-red-800"
            >
              {isSubmitting
                ? "Signing in..."
                : "Sign in"}

              <LogIn className="ml-2 h-4 w-4" />
            </Button>

          </form>
        </section>

        {/* ================================================================
            REGISTER
            ================================================================ */}

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?
          </p>

          <Link
            href="/register"
            className="mt-2 inline-flex items-center gap-2 font-bold text-red-700 hover:underline"
          >
            <UserPlus className="h-4 w-4" />
            Register / Apply
          </Link>
        </div>

      </div>
    </main>
  );
}