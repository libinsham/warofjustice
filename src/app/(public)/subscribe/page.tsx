"use client";

import Link from "next/link";
import { useState } from "react";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QRCodeSVG } from "qrcode.react";
import { isAxiosError } from "axios";

import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  MessageCircle,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/providers/auth-provider";

/* ==========================================================================
   OFFICIAL WAR OF JUSTICE CHANNELS
   ========================================================================== */

const CHANNELS = [
  {
    key: "youtube",
    label: "YouTube",
    url: "https://youtube.com/@warofjustice1?si=UbnxbMjDcVwH1gEG&cxqr=raBA8pGCOZlvl2nqpeDJez",
    color: "bg-red-600 hover:bg-red-700",
    qrColor: "#dc2626",
  },
  {
    key: "whatsapp",
    label: "WhatsApp Channel",
    url: "https://whatsapp.com/channel/0029Vb8OkvXCXC3GpYsFSm0o",
    color: "bg-green-600 hover:bg-green-700",
    qrColor: "#16a34a",
  },
  {
    key: "facebook",
    label: "Facebook",
    url: "https://www.facebook.com/share/1SMGVTJ5Vn/",
    color: "bg-blue-600 hover:bg-blue-700",
    qrColor: "#2563eb",
  },
  {
    key: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/warofjusticeprs/",
    color:
      "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:opacity-90",
    qrColor: "#db2777",
  },
];

/* ==========================================================================
   VALIDATION
   ========================================================================== */

const subscribeSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),

  full_name: z
    .string()
    .min(1, "Full name is required"),

  email: z
    .string()
    .email("Enter a valid email address"),

  phone_number: z
    .string()
    .min(8, "Enter a valid mobile number"),

  whatsapp_number: z
    .string()
    .optional(),
});

type SubscribeFormValues =
  z.infer<typeof subscribeSchema>;

/* ==========================================================================
   ERROR TEXT
   ========================================================================== */

function ErrorText({
  message,
}: {
  message?: string;
}) {
  if (!message) return null;

  return (
    <p className="mt-1 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function SubscribePage() {
  const router = useRouter();
  const { refresh } = useAuth();

  /* ---------------------------------------------------------------------- */
  /* STATE                                                                  */
  /* ---------------------------------------------------------------------- */

  const [confirmedChannels, setConfirmedChannels] =
    useState<Set<string>>(new Set());

  const [channelVisited, setChannelVisited] =
    useState(false);

  const [subscriberDeclared, setSubscriberDeclared] =
    useState(false);

  const [subscriberError, setSubscriberError] =
    useState<string | null>(null);

  const [subscriberSubmitting, setSubscriberSubmitting] =
    useState(false);

  /* ---------------------------------------------------------------------- */
  /* FORM                                                                   */
  /* ---------------------------------------------------------------------- */

  const subscriberForm =
    useForm<SubscribeFormValues>({
      resolver: zodResolver(subscribeSchema),

      defaultValues: {
        username: "",
        password: "",
        full_name: "",
        email: "",
        phone_number: "",
        whatsapp_number: "",
      },
    });

  /* ==========================================================================
     CHANNEL CLICK
     ========================================================================== */

  const handleChannelLinkClick = (
    event: MouseEvent<HTMLAnchorElement>,
    key: string,
  ) => {
    event.stopPropagation();

    setChannelVisited(true);

    setConfirmedChannels((previous) => {
      const next = new Set(previous);

      next.add(key);

      return next;
    });
  };

  /* ==========================================================================
     SUBMIT
     ========================================================================== */

  const onSubscriberSubmit = async (
    data: SubscribeFormValues,
  ) => {
    setSubscriberError(null);

    /* -------------------------------------------------------------- */
    /* REQUIRE CHANNEL VISIT                                         */
    /* -------------------------------------------------------------- */

    if (!channelVisited) {
      setSubscriberError(
        "Please open at least one official War of Justice channel before submitting.",
      );

      return;
    }

    /* -------------------------------------------------------------- */
    /* REQUIRE DECLARATION                                            */
    /* -------------------------------------------------------------- */

    if (!subscriberDeclared) {
      setSubscriberError(
        "Please confirm the declaration before submitting.",
      );

      return;
    }

    setSubscriberSubmitting(true);

    try {
      const user =
        await authApi.registerSubscriber({
          ...data,

          channels_confirmed:
            Array.from(confirmedChannels),

          declaration_confirmed:
            subscriberDeclared,
        });

      await refresh();

      const applicationId =
        user.subscriber_application
          ?.application_id ?? "";

      router.push(
        `/subscribe/success?id=${encodeURIComponent(
          applicationId,
        )}`,
      );
    } catch (error) {
      let detail: string | null = null;

      if (isAxiosError(error)) {
        detail =
          error.response?.data
            ?.declaration_confirmed?.[0] ??
          error.response?.data?.detail ??
          error.response?.data?.message ??
          null;
      }

      setSubscriberError(
        detail ??
          "Registration failed. That email or username may already be in use.",
      );
    } finally {
      setSubscriberSubmitting(false);
    }
  };

  /* ==========================================================================
     RENDER
     ========================================================================== */

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-white to-gray-50 px-3 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        {/* ================================================================
            PAGE HEADER
            ================================================================ */}

        <div className="mb-8 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-red-700">
            WAR OF JUSTICE
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            Subscriber Registration
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            Create your War of Justice subscriber
            account and stay connected with our
            official channels.
          </p>
        </div>

        {/* ================================================================
            MAIN CARD
            ================================================================ */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* -------------------------------------------------------------- */}
          {/* HEADER                                                          */}
          {/* -------------------------------------------------------------- */}

          <div className="bg-gradient-to-r from-red-800 to-red-700 px-5 py-6 text-white sm:px-8">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                <UserPlus className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.17em] text-red-100">
                  SUBSCRIBE
                </p>

                <h2 className="mt-1 text-xl font-black sm:text-2xl">
                  Join War of Justice
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-red-100">
                  Create your subscriber account
                  and follow our official channels.
                </p>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* FORM                                                            */}
          {/* -------------------------------------------------------------- */}

          <form
            onSubmit={subscriberForm.handleSubmit(
              onSubscriberSubmit,
            )}
            className="space-y-6 p-5 sm:p-8"
          >
            {/* ERROR */}

            {subscriberError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {subscriberError}
              </div>
            )}

            {/* ============================================================
                ACCOUNT DETAILS
                ============================================================ */}

            <Card className="border-gray-200 shadow-none">
              <CardContent className="space-y-5 pt-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-700" />

                  <h3 className="text-sm font-black text-gray-900">
                    Account Credentials
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* USERNAME */}

                  <div className="space-y-1.5">
                    <Label htmlFor="username">
                      User Name
                    </Label>

                    <Input
                      id="username"
                      placeholder="Enter your user name"
                      autoComplete="username"
                      {...subscriberForm.register(
                        "username",
                      )}
                    />

                    <ErrorText
                      message={
                        subscriberForm.formState
                          .errors.username?.message
                      }
                    />
                  </div>

                  {/* PASSWORD */}

                  <div className="space-y-1.5">
                    <Label htmlFor="password">
                      Password
                    </Label>

                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      autoComplete="new-password"
                      {...subscriberForm.register(
                        "password",
                      )}
                    />

                    <ErrorText
                      message={
                        subscriberForm.formState
                          .errors.password?.message
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ============================================================
                CONTACT INFORMATION
                ============================================================ */}

            <Card className="border-gray-200 shadow-none">
              <CardContent className="space-y-5 pt-5">
                <h3 className="text-sm font-black text-gray-900">
                  Contact Information
                </h3>

                {/* FULL NAME */}

                <div className="space-y-1.5">
                  <Label htmlFor="full_name">
                    Full Name
                  </Label>

                  <Input
                    id="full_name"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    {...subscriberForm.register(
                      "full_name",
                    )}
                  />

                  <ErrorText
                    message={
                      subscriberForm.formState
                        .errors.full_name?.message
                    }
                  />
                </div>

                {/* EMAIL */}

                <div className="space-y-1.5">
                  <Label htmlFor="email">
                    Email Address
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    autoComplete="email"
                    {...subscriberForm.register(
                      "email",
                    )}
                  />

                  <ErrorText
                    message={
                      subscriberForm.formState
                        .errors.email?.message
                    }
                  />
                </div>

                {/* PHONE + WHATSAPP */}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone_number">
                      Mobile Number
                    </Label>

                    <Input
                      id="phone_number"
                      placeholder="+91 Enter mobile number"
                      autoComplete="tel"
                      {...subscriberForm.register(
                        "phone_number",
                      )}
                    />

                    <ErrorText
                      message={
                        subscriberForm.formState
                          .errors.phone_number?.message
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="whatsapp_number">
                      WhatsApp Number
                    </Label>

                    <Input
                      id="whatsapp_number"
                      placeholder="+91 Enter WhatsApp number"
                      autoComplete="tel"
                      {...subscriberForm.register(
                        "whatsapp_number",
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ============================================================
                OFFICIAL CHANNELS
                ============================================================ */}

            <Card className="border-red-200 bg-red-50/40 shadow-none">
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                    <MessageCircle className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-red-700">
                      Follow War of Justice
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-gray-600">
                      Please open at least one official
                      channel before submitting your
                      subscriber application.
                    </p>
                  </div>
                </div>

                {/* CHANNEL GRID */}

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {CHANNELS.map((channel) => {
                    const confirmed =
                      confirmedChannels.has(
                        channel.key,
                      );

                    return (
                      <div
                        key={channel.key}
                        className={`rounded-xl border-2 p-3 text-center transition ${
                          confirmed
                            ? "border-green-500 bg-white shadow-sm"
                            : "border-transparent bg-white"
                        }`}
                      >
                        {/* CHANNEL NAME */}

                        <p className="mb-3 min-h-[32px] text-[11px] font-black leading-4 text-gray-900">
                          {channel.label}
                        </p>

                        {/* QR */}

                        <a
                          href={channel.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) =>
                            handleChannelLinkClick(
                              event,
                              channel.key,
                            )
                          }
                          aria-label={`Open ${channel.label}`}
                          className="mx-auto flex w-fit rounded-lg border border-gray-200 bg-white p-2 transition hover:scale-[1.03]"
                        >
                          <QRCodeSVG
                            value={channel.url}
                            size={88}
                            bgColor="#ffffff"
                            fgColor={
                              channel.qrColor
                            }
                            level="M"
                          />
                        </a>

                        {/* OPEN BUTTON */}

                        <a
                          href={channel.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) =>
                            handleChannelLinkClick(
                              event,
                              channel.key,
                            )
                          }
                          className={`mt-3 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-black text-white transition ${channel.color}`}
                        >
                          {confirmed ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Opened
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-3.5 w-3.5" />
                              Open Channel
                            </>
                          )}
                        </a>
                      </div>
                    );
                  })}
                </div>

                {/* ACTIVATION */}

                {channelVisited ? (
                  <div className="mt-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-xs font-semibold text-green-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />

                    <span>
                      At least one official channel
                      has been opened. You can now
                      submit your application.
                    </span>
                  </div>
                ) : (
                  <div className="mt-5 rounded-lg border border-gray-200 bg-white px-3 py-3 text-center text-xs font-medium text-gray-500">
                    Submit Application will become
                    available after opening at least
                    one official channel.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ============================================================
                DECLARATION
                ============================================================ */}

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs leading-5 text-gray-600">
              <input
                type="checkbox"
                checked={subscriberDeclared}
                onChange={(event) =>
                  setSubscriberDeclared(
                    event.target.checked,
                  )
                }
                className="mt-1 h-4 w-4 accent-red-700"
              />

              <span>
                <strong className="font-bold text-gray-800">
                  Declaration:
                </strong>{" "}
                I confirm that I have opened and
                followed at least one of the official
                War of Justice channels before
                submitting my subscriber application.
              </span>
            </label>

            {/* ============================================================
                SUBMIT
                ============================================================ */}

            {channelVisited ? (
              <Button
                type="submit"
                size="lg"
                disabled={
                  subscriberSubmitting
                }
                className="w-full bg-red-700 font-black hover:bg-red-800"
              >
                {subscriberSubmitting
                  ? "Submitting..."
                  : "Submit Subscriber Application"}

                {!subscriberSubmitting && (
                  <ArrowRight className="ml-1 h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center text-xs font-semibold text-gray-500">
                Submit Application is currently
                hidden.
                <br />
                Open at least one official channel
                above to activate submission.
              </div>
            )}

            {/* ============================================================
                FOOTER
                ============================================================ */}

            <div className="space-y-2 text-center">
              <p className="text-[10px] text-gray-500">
                Secure submission · Your information
                is handled confidentially
              </p>

              <p className="text-xs text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-red-700 hover:text-red-800"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}