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
  FileText,
  Upload,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/providers/auth-provider";
import { SITE_NAME } from "@/lib/site-config";

/* ==========================================================================
   REGISTRATION MODE
   ========================================================================== */

type RegistrationMode =
  | "subscriber"
  | "member";

/* ==========================================================================
   SUBSCRIBER
   ========================================================================== */

const CHANNELS = [
  {
    key: "youtube",
    label: "YouTube",
    url: "https://youtube.com/@warofjustice1?si=UbnxbMjDcVwH1gEG&cxqr=raBA8pGCOZlvl2nqpeDJez",
    icon: null,
    color: "bg-red-600 hover:bg-red-700",
    qrColor: "#dc2626",
  },
  {
    key: "whatsapp",
    label: "WhatsApp Channel",
    url: "https://whatsapp.com/channel/0029Vb8OkvXCXC3GpYsFSm0o",
    icon: null,
    color: "bg-green-600 hover:bg-green-700",
    qrColor: "#16a34a",
  },
  {
    key: "facebook",
    label: "Facebook",
    url: "https://www.facebook.com/share/1SMGVTJ5Vn/",
    icon: null,
    color: "bg-blue-600 hover:bg-blue-700",
    qrColor: "#2563eb",
  },
  {
    key: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/warofjusticeprs/",
    icon: null,
    color:
      "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:opacity-90",
    qrColor: "#db2777",
  },
];

const subscribeSchema = z.object({
  username: z
    .string()
    .min(
      3,
      "Username must be at least 3 characters",
    ),

  password: z
    .string()
    .min(
      8,
      "Password must be at least 8 characters",
    ),

  full_name: z
    .string()
    .min(
      1,
      "Full name is required",
    ),

  email: z
    .string()
    .email(
      "Enter a valid email address",
    ),

  phone_number: z
    .string()
    .min(
      8,
      "Enter a valid mobile number",
    ),

  whatsapp_number: z
    .string()
    .optional(),
});

type SubscribeFormValues =
  z.infer<typeof subscribeSchema>;

/* ==========================================================================
   MEMBER / CONTRIBUTOR
   ========================================================================== */

const memberSchema = z
  .object({
    full_name: z
      .string()
      .min(
        2,
        "Full name is required",
      ),

    date_of_birth: z
      .string()
      .min(
        1,
        "Date of birth is required",
      ),

    gender: z
      .string()
      .min(
        1,
        "Please select gender",
      ),

    mobile_number: z
      .string()
      .min(
        10,
        "Enter a valid mobile number",
      ),

    email: z
      .string()
      .email(
        "Enter a valid email address",
      ),

    aadhaar_number: z
      .string()
      .refine(
        (value) =>
          value === "" ||
          /^\d{12}$/.test(value),
        "Aadhaar must contain 12 digits",
      ),

    pan_number: z
      .string()
      .refine(
        (value) =>
          value === "" ||
          /^[A-Za-z]{5}\d{4}[A-Za-z]$/.test(
            value,
          ),
        "Enter a valid PAN number",
      ),

    house_street: z
      .string()
      .min(
        2,
        "House / street is required",
      ),

    village_town_city: z
      .string()
      .min(
        2,
        "Village / town / city is required",
      ),

    taluk: z
      .string()
      .min(
        1,
        "Taluk is required",
      ),

    mandal: z
      .string()
      .min(
        1,
        "Mandal is required",
      ),

    district: z
      .string()
      .min(
        1,
        "District is required",
      ),

    state: z
      .string()
      .min(
        1,
        "State is required",
      ),

    pin_code: z
      .string()
      .regex(
        /^\d{6}$/,
        "PIN code must contain 6 digits",
      ),

    residency_status: z
      .string()
      .min(
        1,
        "Please select residential status",
      ),

    citizenship: z
      .string()
      .min(
        1,
        "Please select citizenship",
      ),

    education: z
      .string()
      .min(
        1,
        "Please select education",
      ),

    profession: z
      .string()
      .min(
        1,
        "Please select profession",
      ),

    bpl_status: z
      .string()
      .min(
        1,
        "Please select BPL status",
      ),

    reporting_areas: z
      .array(z.string())
      .min(
        1,
        "Select at least one reporting area",
      ),

    requested_role: z
      .string()
      .min(
        1,
        "Please select an application role",
      ),

    other_role: z
      .string()
      .optional(),

    declaration_confirmed: z
      .boolean()
      .refine(
        (value) => value === true,
        {
          message:
            "Please accept the declaration",
        },
      ),

    terms_confirmed: z
      .boolean()
      .refine(
        (value) => value === true,
        {
          message:
            "Please accept the Terms & Conditions",
        },
      ),

    privacy_confirmed: z
      .boolean()
      .refine(
        (value) => value === true,
        {
          message:
            "Please accept the Privacy Policy",
        },
      ),

    communication_consent:
      z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (
      data.requested_role === "other" &&
      !data.other_role?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["other_role"],
        message:
          "Please specify your role",
      });
    }
  });

type MemberFormValues =
  z.infer<typeof memberSchema>;

/* ==========================================================================
   MEMBERSHIP ROLES
   ========================================================================== */

const MEMBERSHIP_ROLES = [
  {
    value: "member",
    label: "Member",
    description:
      "Be an active member",
  },
  {
    value: "contributor",
    label: "Contributor",
    description:
      "Share news & articles",
  },
  {
    value: "reporter",
    label: "Reporter",
    description:
      "Report from your area",
  },
  {
    value: "media_staff",
    label: "Media Staff",
    description:
      "Work with our media team",
  },
  {
    value: "editor",
    label: "Editor",
    description:
      "Review & edit content",
  },
  {
    value: "bureau_chief",
    label: "Bureau Chief",
    description:
      "Lead regional coverage",
  },
  {
    value: "camera_person",
    label: "Camera Person",
    description:
      "Capture photos & videos",
  },
  {
    value: "volunteer",
    label: "Volunteer",
    description:
      "Support our mission",
  },
  {
    value: "district_coordinator",
    label:
      "District Coordinator",
    description:
      "Coordinate at district level",
  },
  {
    value: "state_coordinator",
    label:
      "State Coordinator",
    description:
      "Coordinate at state level",
  },
  {
    value: "other",
    label: "Other",
    description:
      "Specify another role",
  },
];

/* ==========================================================================
   REPORTING AREAS
   ========================================================================== */

const REPORTING_AREAS = [
  "Crime",
  "Politics",
  "Courts & Legal",
  "Education",
  "Health",
  "Civic Issues",
  "Human Rights",
  "Agriculture",
  "Environment",
  "Business",
  "Technology",
  "Investigative Journalism",
  "Sports",
  "Entertainment",
  "Other",
];

/* ==========================================================================
   HELPERS
   ========================================================================== */

function ErrorText({
  message,
}: {
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600"
    >
      <span aria-hidden="true">⚠</span>
      <span>{message}</span>
    </p>
  );
}

function errorInputClass(hasError: boolean) {
  return hasError
    ? "border-red-600 ring-1 ring-red-100 focus-visible:border-red-600 focus-visible:ring-red-600"
    : "";
}

function SectionHeader({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3 border-b border-gray-100 pb-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-xs font-black text-red-700 ring-1 ring-red-100">
        {number}
      </div>

      <div>
        <h2 className="text-base font-black text-red-700">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-[11px] text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function UploadBox({
  label,
  required = false,
  accept,
  file,
  onChange,
  error,
}: {
  label: string;
  required?: boolean;
  accept?: string;
  file: File | null;
  onChange: (
    file: File | null,
  ) => void;
  error?: string;
}) {
  return (
    <div className={`rounded-xl border border-dashed p-4 text-center transition ${
        error
          ? "border-red-600 bg-red-50/60 ring-1 ring-red-100"
          : "border-gray-300 bg-gray-50 hover:border-red-400 hover:bg-red-50/30"
      }`}>
      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-700">
        <Upload className="h-4 w-4" />
      </div>

      <p className="text-xs font-bold text-gray-900">
        {label}

        {required && (
          <span className="text-red-600">
            {" "}
            *
          </span>
        )}
      </p>

      <p className="mt-1 text-[10px] text-gray-500">
        JPG, PNG or PDF · Max 5MB
      </p>

      <label className="mt-3 inline-flex cursor-pointer rounded-md bg-red-700 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-red-800">
        {file ? "Change" : "Upload"}

        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={(event) =>
            onChange(
              event.target.files?.[0] ??
                null,
            )
          }
        />
      </label>

      {file && (
        <p className="mt-2 truncate text-[10px] text-gray-600">
          {file.name}
        </p>
      )}

      <ErrorText message={error} />
    </div>
  );
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function RegisterPage() {
  const router = useRouter();

  const { refresh } = useAuth();

  /* ---------------------------------------------------------------------- */
  /* MODE                                                                   */
  /* ---------------------------------------------------------------------- */

  const [mode, setMode] =
    useState<RegistrationMode>(
      "subscriber",
    );

  /* ---------------------------------------------------------------------- */
  /* SUBSCRIBER STATE                                                       */
  /* ---------------------------------------------------------------------- */

  const [
    confirmedChannels,
    setConfirmedChannels,
  ] = useState<Set<string>>(
    new Set(),
  );

  const [
    channelVisited,
    setChannelVisited,
  ] = useState(false);

  const [
    subscriberDeclared,
    setSubscriberDeclared,
  ] = useState(false);

  const [
    subscriberError,
    setSubscriberError,
  ] = useState<string | null>(
    null,
  );

  const [
    subscriberSubmitting,
    setSubscriberSubmitting,
  ] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* MEMBER STATE                                                           */
  /* ---------------------------------------------------------------------- */

  const [
    memberSuccess,
    setMemberSuccess,
  ] = useState<string | null>(
    null,
  );

  const [
    memberError,
    setMemberError,
  ] = useState<string | null>(
    null,
  );

  const [
    memberSubmitting,
    setMemberSubmitting,
  ] = useState(false);

  const [selfieFile, setSelfieFile] =
    useState<File | null>(null);

  const [
    aadhaarFile,
    setAadhaarFile,
  ] = useState<File | null>(null);

  const [panFile, setPanFile] =
    useState<File | null>(null);

  const [
    identityFile,
    setIdentityFile,
  ] = useState<File | null>(null);

  const [
    supportingFiles,
    setSupportingFiles,
  ] = useState<File[]>([]);

  const [fileErrors, setFileErrors] = useState<{
    selfie?: string;
    aadhaar?: string;
    pan?: string;
    identity?: string;
    supporting?: string;
  }>({});

  /* ---------------------------------------------------------------------- */
  /* FORMS                                                                  */
  /* ---------------------------------------------------------------------- */

  const subscriberForm =
    useForm<SubscribeFormValues>({
      resolver:
        zodResolver(
          subscribeSchema,
        ),

      defaultValues: {
        username: "",
        password: "",
        full_name: "",
        email: "",
        phone_number: "",
        whatsapp_number: "",
      },
    });

  const memberForm =
    useForm<MemberFormValues>({
      resolver:
        zodResolver(memberSchema),

      defaultValues: {
        full_name: "",
        date_of_birth: "",
        gender: "",
        mobile_number: "",
        email: "",
        aadhaar_number: "",
        pan_number: "",
        house_street: "",
        village_town_city: "",
        taluk: "",
        mandal: "",
        district: "",
        state: "",
        pin_code: "",
        residency_status: "",
        citizenship: "indian",
        education: "",
        profession: "",
        bpl_status: "",
        reporting_areas: [],
        requested_role: "member",
        other_role: "",
        declaration_confirmed: false,
        terms_confirmed: false,
        privacy_confirmed: false,
        communication_consent: false,
      },
    });

  const selectedRole =
    memberForm.watch(
      "requested_role",
    );

  /* ==========================================================================
     MODE CHANGE
     ========================================================================== */

  const changeMode = (
    nextMode: RegistrationMode,
  ) => {
    setMode(nextMode);

    setSubscriberError(null);
    setMemberError(null);
  };

  /* ==========================================================================
     SUBSCRIBER CHANNEL
     ========================================================================== */

  const handleChannelLinkClick = (
    event: MouseEvent<HTMLAnchorElement>,
    key: string,
  ) => {
    event.stopPropagation();

    /*
     * Opening at least one official
     * channel activates subscriber submission.
     */

    setChannelVisited(true);

    setConfirmedChannels((previous) => {
      const next = new Set(previous);

      next.add(key);

      return next;
    });
  };

  /* ==========================================================================
     SUBSCRIBER SUBMIT
     ========================================================================== */

  const onSubscriberSubmit =
    async (
      data: SubscribeFormValues,
    ) => {
      setSubscriberError(null);

      if (!channelVisited) {
        setSubscriberError(
          "Please open at least one official channel before submitting.",
        );
        return;
      }

      if (!subscriberDeclared) {
        setSubscriberError(
          "Please confirm the declaration before submitting.",
        );
        return;
      }

      setSubscriberSubmitting(true);

      try {
        const user =
          await authApi.registerSubscriber(
            {
              ...data,

              channels_confirmed:
                Array.from(
                  confirmedChannels,
                ),

              declaration_confirmed:
                subscriberDeclared,
            },
          );

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
        const detail =
          isAxiosError(error)
            ? error.response?.data
                ?.declaration_confirmed?.[0] ??
              error.response?.data
                ?.detail ??
              error.response?.data
                ?.message
            : null;

        setSubscriberError(
          detail ??
            "Registration failed. That email may already be in use.",
        );
      } finally {
        setSubscriberSubmitting(
          false,
        );
      }
    };

  /* ==========================================================================
     MEMBER SUBMIT
     ========================================================================== */

  const onMemberSubmit =
    async (
      data: MemberFormValues,
    ) => {
      setMemberError(null);
      setMemberSuccess(null);
      setFileErrors({});

      if (!selfieFile) {
        setFileErrors({ selfie: "Please upload your selfie photograph." });
        setMemberError("Please upload your selfie photograph.");
        return;
      }

      if (!identityFile) {
        setFileErrors({ identity: "Please upload an identity proof." });
        setMemberError("Please upload an identity proof.");
        return;
      }

      const maxFileSize = 5 * 1024 * 1024;

      const validateFile = (file: File, label: string, allowedTypes: string[]) => {
        if (file.size > maxFileSize) return `${label} must be 5MB or smaller.`;
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
          return `${label} must be a JPG, PNG or PDF file.`;
        }
        return null;
      };

      const selfieValidation = validateFile(selfieFile, "Selfie photograph", ["image/jpeg", "image/png"]);
      if (selfieValidation) {
        setFileErrors({ selfie: selfieValidation });
        setMemberError(selfieValidation);
        return;
      }

      const identityValidation = validateFile(identityFile, "Identity proof", ["image/jpeg", "image/png", "application/pdf"]);
      if (identityValidation) {
        setFileErrors({ identity: identityValidation });
        setMemberError(identityValidation);
        return;
      }

      if (aadhaarFile) {
        const error = validateFile(aadhaarFile, "Aadhaar card", ["image/jpeg", "image/png", "application/pdf"]);
        if (error) {
          setFileErrors({ aadhaar: error });
          setMemberError(error);
          return;
        }
      }

      if (panFile) {
        const error = validateFile(panFile, "PAN card", ["image/jpeg", "image/png", "application/pdf"]);
        if (error) {
          setFileErrors({ pan: error });
          setMemberError(error);
          return;
        }
      }

      const supportingFile = supportingFiles[0];
      if (supportingFile) {
        const error = validateFile(supportingFile, "Supporting document", ["image/jpeg", "image/png", "application/pdf"]);
        if (error) {
          setFileErrors({ supporting: error });
          setMemberError(error);
          return;
        }
      }

      setMemberSubmitting(true);

      try {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(key, item));
            return;
          }
          if (typeof value === "boolean") {
            formData.append(key, value ? "true" : "false");
            return;
          }
          formData.append(key, String(value ?? ""));
        });

        formData.append("selfie", selfieFile);
        if (aadhaarFile) formData.append("aadhaar_card", aadhaarFile);
        if (panFile) formData.append("pan_card", panFile);
        formData.append("identity_proof", identityFile);
        supportingFiles.forEach((file) => formData.append("supporting_documents", file));

        const response = await authApi.registerMemberApplication(formData);

        setMemberSuccess(
          response?.message ?? "Your application has been submitted successfully.",
        );

        memberForm.reset();
        setSelfieFile(null);
        setAadhaarFile(null);
        setPanFile(null);
        setIdentityFile(null);
        setSupportingFiles([]);
        setFileErrors({});

        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        if (isAxiosError(error)) {
          const responseData = error.response?.data;
          const formFields = [
            "full_name", "date_of_birth", "gender", "mobile_number", "email",
            "aadhaar_number", "pan_number", "house_street", "village_town_city",
            "taluk", "mandal", "district", "state", "pin_code",
            "residency_status", "citizenship", "education", "profession",
            "bpl_status", "reporting_areas", "requested_role", "other_role",
            "declaration_confirmed", "terms_confirmed", "privacy_confirmed",
            "communication_consent",
          ] as const;

          let firstFieldError: string | null = null;

          formFields.forEach((field) => {
            const value = responseData?.[field];
            const message = Array.isArray(value) && value.length > 0
              ? String(value[0])
              : typeof value === "string" && value
                ? value
                : null;

            if (message) {
              memberForm.setError(field, { type: "server", message });
              if (!firstFieldError) firstFieldError = message;
            }
          });

          const detail =
            responseData?.detail ||
            responseData?.message ||
            firstFieldError ||
            "Application submission failed. Please check the highlighted fields and try again.";

          setMemberError(String(detail));
        } else {
          setMemberError("Application submission failed. Please try again.");
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        setMemberSubmitting(false);
      }
    };
  /* ==========================================================================
     RETURN
     ========================================================================== */

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-white to-gray-50 px-3 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">

        {/* ================================================================
            HEADER
            ================================================================ */}

        <div className="mb-7 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-red-700">
            WAR OF JUSTICE
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            Registration & Application
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            Choose your registration type
            below to continue.
          </p>
        </div>

        {/* ================================================================
            ALWAYS-VISIBLE TWO BUTTON SELECTOR
            ================================================================ */}

        <div className="mx-auto mb-7 w-full max-w-2xl">
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
            SUBSCRIBER FORM
            ================================================================ */}

        {mode ===
          "subscriber" && (
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* HEADER */}

            <div className="bg-gradient-to-r from-red-800 to-red-700 px-6 py-6 text-white sm:px-8">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <UserPlus className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.17em] text-red-100">
                    SUBSCRIBE
                  </p>

                  <h2 className="mt-1 text-xl font-black sm:text-2xl">
                    Subscriber Registration
                  </h2>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-red-100">
                    Create your subscriber
                    account and follow our
                    official channels.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={subscriberForm.handleSubmit(
                onSubscriberSubmit,
              )}
              className="space-y-6 p-5 sm:p-8"
            >

              {/* ERROR */}

              {subscriberError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {subscriberError}
                </div>
              )}

              {/* ACCOUNT */}

              <Card className="border-gray-200 shadow-none">
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-700" />

                    <h3 className="text-sm font-black">
                      Account Credentials
                    </h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>
                        User Name
                      </Label>

                      <Input
                        placeholder="Enter your user name"
                        {...subscriberForm.register(
                          "username",
                        )}
                      />

                      <ErrorText
                        message={
                          subscriberForm
                            .formState.errors
                            .username?.message
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        Password
                      </Label>

                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...subscriberForm.register(
                          "password",
                        )}
                      />

                      <ErrorText
                        message={
                          subscriberForm
                            .formState.errors
                            .password?.message
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CONTACT */}

              <Card className="border-gray-200 shadow-none">
                <CardContent className="space-y-4 pt-6">
                  <h3 className="text-sm font-black">
                    Contact Information
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>
                        Name
                      </Label>

                      <Input
                        placeholder="Enter your full name"
                        {...subscriberForm.register(
                          "full_name",
                        )}
                      />

                      <ErrorText
                        message={
                          subscriberForm
                            .formState.errors
                            .full_name?.message
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        Email
                      </Label>

                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        {...subscriberForm.register(
                          "email",
                        )}
                      />

                      <ErrorText
                        message={
                          subscriberForm
                            .formState.errors
                            .email?.message
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        Cell No.
                      </Label>

                      <Input
                        placeholder="+91 Enter mobile number"
                        {...subscriberForm.register(
                          "phone_number",
                        )}
                      />

                      <ErrorText
                        message={
                          subscriberForm
                            .formState.errors
                            .phone_number
                            ?.message
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        WhatsApp No.
                      </Label>

                      <Input
                        placeholder="+91 Enter WhatsApp number"
                        {...subscriberForm.register(
                          "whatsapp_number",
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CHANNELS */}

              <Card className="border-red-200 bg-red-50/40 shadow-none">
                <CardContent className="pt-6">
                  <h3 className="text-sm font-black text-red-700">
                    Follow {SITE_NAME}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    Open at least one official
                    channel QR code or link
                    before submitting.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {CHANNELS.map(
                      (channel) => {
                        const confirmed =
                          confirmedChannels.has(
                            channel.key,
                          );

                        return (
                          <div
                            key={
                              channel.key
                            }
                            className={`rounded-xl border-2 p-3 text-center transition ${
                              confirmed
                                ? "border-red-600 bg-white"
                                : "border-transparent bg-white"
                            }`}
                          >
                            <p className="mb-2 text-[11px] font-bold">
                              {channel.label}
                            </p>

                            <a
                              href={
                                channel.url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(
                                event,
                              ) =>
                                handleChannelLinkClick(
                                  event,
                                  channel.key,
                                )
                              }
                              className="block"
                            >
                              <QRCodeSVG
                                value={channel.url}
                                size={76}
                                bgColor="#ffffff"
                                fgColor={channel.qrColor}
                                level="M"
                                className="mx-auto"
                              />
                            </a>

                            <a
                              href={
                                channel.url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(
                                event,
                              ) =>
                                handleChannelLinkClick(
                                  event,
                                  channel.key,
                                )
                              }
                              className={`mt-2 block rounded px-2 py-1.5 text-[10px] font-bold text-white ${channel.color}`}
                            >
                              {confirmed
                                ? "✓ Opened"
                                : "Open Channel"}
                            </a>
                          </div>
                        );
                      },
                    )}
                  </div>

                  {channelVisited ? (
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      At least one official
                      channel has been
                      opened. Submission is
                      now available.
                    </div>
                  ) : (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-white px-3 py-2 text-center text-xs font-medium text-gray-500">
                      Submit Application is
                      hidden until you open at
                      least one official channel.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* DECLARATION */}

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs leading-5 text-gray-600">
                <input
                  type="checkbox"
                  checked={
                    subscriberDeclared
                  }
                  onChange={(event) =>
                    setSubscriberDeclared(
                      event.target.checked,
                    )
                  }
                  className="mt-1 h-4 w-4 accent-red-700"
                />

                <span>
                  Declaration: I confirm
                  that I have followed at
                  least one of the above
                  official channels before
                  submitting my application.
                </span>
              </label>

              {/* SUBMIT / HIDDEN */}

              {channelVisited ? (
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-red-700 font-black hover:bg-red-800"
                  disabled={
                    subscriberSubmitting
                  }
                >
                  {subscriberSubmitting
                    ? "Submitting..."
                    : "Submit Subscriber Application"}

                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center text-xs font-semibold text-gray-500">
                  Submit Application is
                  currently hidden.
                  <br />
                  Open at least one official
                  channel above to activate it.
                </div>
              )}

              <p className="text-center text-[10px] text-gray-500">
                Secure submission · Your
                information is handled
                confidentially
              </p>
            </form>
          </section>
        )}

        {/* ================================================================
            MEMBER / CONTRIBUTOR FORM
            ================================================================ */}

        {mode ===
          "member" && (
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* HEADER */}

            <div className="bg-gradient-to-r from-gray-950 to-gray-800 px-6 py-6 text-white sm:px-8">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-600">
                  <UserPlus className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.17em] text-red-300">
                    MEMBER REGISTRATION
                  </p>

                  <h2 className="mt-1 text-xl font-black sm:text-2xl">
                    Member Registration &
                    News Contributor Application
                  </h2>

                  <p className="mt-1 max-w-3xl text-xs leading-5 text-gray-300">
                    Apply to become a member,
                    contributor, reporter,
                    media staff, editor or
                    other War of Justice
                    community role.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={memberForm.handleSubmit(
                onMemberSubmit,
              )}
              className="space-y-6 p-5 sm:p-8"
            >

                {/* ========================================================
                    01 PERSONAL
                    ======================================================== */}

                <section>
                  <SectionHeader
                    number="01"
                    title="Personal Information"
                    subtitle="Tell us about yourself"
                  />

                  <div className="grid gap-5 md:grid-cols-2">

                    <div className="space-y-1.5">
                      <Label>
                        Full Name{" "}
                        <span className="text-red-600">
                          *
                        </span>
                      </Label>

                      <Input
                        placeholder="Enter your full name"
                        {...memberForm.register(
                          "full_name",
                        )}
                      
                      className={errorInputClass(Boolean(memberForm.formState.errors.full_name))}
                      />

                      <ErrorText
                        message={
                          memberForm.formState
                            .errors.full_name
                            ?.message
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        Date of Birth{" "}
                        <span className="text-red-600">
                          *
                        </span>
                      </Label>

                      <Input
                        type="date"
                        {...memberForm.register(
                          "date_of_birth",
                        )}
                      
                      className={errorInputClass(Boolean(memberForm.formState.errors.date_of_birth))}
                      />

                      <ErrorText
                        message={
                          memberForm.formState
                            .errors
                            .date_of_birth
                            ?.message
                        }
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>
                        Gender{" "}
                        <span className="text-red-600">
                          *
                        </span>
                      </Label>

                      <div className="flex flex-wrap gap-5">
                        {[
                          [
                            "male",
                            "Male",
                          ],
                          [
                            "female",
                            "Female",
                          ],
                          [
                            "transgender",
                            "Transgender",
                          ],
                          [
                            "other",
                            "Other",
                          ],
                        ].map(
                          ([
                            value,
                            label,
                          ]) => (
                            <label
                              key={
                                value
                              }
                              className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                            >
                              <input
                                type="radio"
                                value={
                                  value
                                }
                                {...memberForm.register(
                                  "gender",
                                )}
                                className="h-4 w-4 accent-red-700"
                              />

                              {
                                label
                              }
                            </label>
                          ),
                        )}
                      </div>

                      <ErrorText
                        message={
                          memberForm
                            .formState
                            .errors
                            .gender
                            ?.message
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        Mobile Number{" "}
                        <span className="text-red-600">
                          *
                        </span>
                      </Label>

                      <Input
                        placeholder="+91 Enter mobile number"
                        {...memberForm.register(
                          "mobile_number",
                        )}
                      
                      className={errorInputClass(Boolean(memberForm.formState.errors.mobile_number))}
                      />

                      <ErrorText
                        message={
                          memberForm
                            .formState
                            .errors
                            .mobile_number
                            ?.message
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        Email Address{" "}
                        <span className="text-red-600">
                          *
                        </span>
                      </Label>

                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        {...memberForm.register(
                          "email",
                        )}
                      
                      className={errorInputClass(Boolean(memberForm.formState.errors.email))}
                      />

                      <ErrorText
                        message={
                          memberForm
                            .formState
                            .errors
                            .email?.message
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        Aadhaar Number
                      </Label>

                      <Input
                        inputMode="numeric"
                        maxLength={12}
                        placeholder="12 digit Aadhaar number"
                        {...memberForm.register(
                          "aadhaar_number",
                        )}
                      
                      className={errorInputClass(Boolean(memberForm.formState.errors.aadhaar_number))}
                      />

                      <ErrorText
                        message={
                          memberForm
                            .formState
                            .errors
                            .aadhaar_number
                            ?.message
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        PAN Number
                      </Label>

                      <Input
                        maxLength={10}
                        placeholder="PAN Number"
                        {...memberForm.register(
                          "pan_number",
                        )}
                      
                      className={errorInputClass(Boolean(memberForm.formState.errors.pan_number))}
                      />

                      <ErrorText
                        message={
                          memberForm
                            .formState
                            .errors
                            .pan_number
                            ?.message
                        }
                      />
                    </div>

                  </div>
                </section>

                {/* ========================================================
                    02 ADDRESS
                    ======================================================== */}

                <section>
                  <SectionHeader
                    number="02"
                    title="Residential Address"
                    subtitle="Where do you live?"
                  />

                  <div className="grid gap-5 md:grid-cols-2">

                    <div className="space-y-1.5">
                      <Label>
                        House No. / Street *
                      </Label>

                      <Input
                        placeholder="Enter house number / street"
                        {...memberForm.register(
                          "house_street",
                        )}
                      
                      className={errorInputClass(Boolean(memberForm.formState.errors.house_street))}
                      />

                      <ErrorText
                        message={
                          memberForm
                            .formState
                            .errors
                            .house_street
                            ?.message
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        Village / Town / City *
                      </Label>

                      <Input
                        placeholder="Enter village / town / city"
                        {...memberForm.register(
                          "village_town_city",
                        )}
                      
                      className={errorInputClass(Boolean(memberForm.formState.errors.village_town_city))}
                      />

                      <ErrorText
                        message={
                          memberForm
                            .formState
                            .errors
                            .village_town_city
                            ?.message
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        Taluk *
                      </Label>

                      <Input
                        placeholder="Taluk"
                        {...memberForm.register(
                          "taluk",
                        )}
                      
                      className={errorInputClass(Boolean(memberForm.formState.errors.taluk))}
                      />

                      <ErrorText
                        message={
                          memberForm
                            .formState
                            .errors
                            .taluk
                            ?.message
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        Mandal *
                      </Label>

                      <Input
                        placeholder="Mandal"
                        {...memberForm.register(
                          "mandal",
                        )}
                      
                      className={errorInputClass(Boolean(memberForm.formState.errors.mandal))}
                      />

                      <ErrorText
                        message={
                          memberForm
                            .formState
                            .errors
                            .mandal
                            ?.message
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        District *
                      </Label>

                      <Input
                        placeholder="District"
                        {...memberForm.register(
                          "district",
                        )}
                      
                      className={errorInputClass(Boolean(memberForm.formState.errors.district))}
                      />

                      <ErrorText
                        message={
                          memberForm
                            .formState
                            .errors
                            .district
                            ?.message
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        State *
                      </Label>

                      <Input
                        placeholder="State"
                        {...memberForm.register(
                          "state",
                        )}
                      
                      className={errorInputClass(Boolean(memberForm.formState.errors.state))}
                      />

                      <ErrorText
                        message={
                          memberForm
                            .formState
                            .errors
                            .state
                            ?.message
                        }
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <Label>
                        PIN Code *
                      </Label>

                      <Input
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="PIN Code"
                        {...memberForm.register(
                          "pin_code",
                        )}
                      
                      className={errorInputClass(Boolean(memberForm.formState.errors.pin_code))}
                      />

                      <ErrorText
                        message={
                          memberForm
                            .formState
                            .errors
                            .pin_code
                            ?.message
                        }
                      />
                    </div>

                  </div>
                </section>

                {/* ========================================================
                    03 APPLICANT
                    ======================================================== */}

                <section>
                  <SectionHeader
                    number="03"
                    title="Applicant Details"
                    subtitle="Tell us about your background"
                  />

                  <div className="grid gap-5">

                    <div className="grid gap-5 md:grid-cols-2">

                      <div className="space-y-1.5">
                        <Label>
                          Residential Status *
                        </Label>

                        <select
                          {...memberForm.register(
                            "residency_status",
                          )}
                          className={`h-10 w-full rounded-md border bg-background px-3 text-sm ${errorInputClass(Boolean(memberForm.formState.errors.residency_status)) || "border-input"}`}
                        >
                          <option value="">
                            Select status
                          </option>
                          <option value="rural">
                            Rural
                          </option>
                          <option value="urban">
                            Urban
                          </option>
                          <option value="semi_urban">
                            Semi-Urban
                          </option>
                          <option value="tribal">
                            Tribal Area
                          </option>
                        </select>

                        <ErrorText
                          message={
                            memberForm
                              .formState
                              .errors
                              .residency_status
                              ?.message
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label>
                          Citizenship *
                        </Label>

                        <select
                          {...memberForm.register(
                            "citizenship",
                          )}
                          className={`h-10 w-full rounded-md border bg-background px-3 text-sm ${errorInputClass(Boolean(memberForm.formState.errors.citizenship)) || "border-input"}`}
                        >
                          <option value="">
                            Select citizenship
                          </option>
                          <option value="indian">
                            Indian
                          </option>
                          <option value="nri">
                            NRI
                          </option>
                          <option value="other">
                            Other
                          </option>
                        </select>

                        <ErrorText
                          message={
                            memberForm
                              .formState
                              .errors
                              .citizenship
                              ?.message
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label>
                          Educational Status *
                        </Label>

                        <select
                          {...memberForm.register(
                            "education",
                          )}
                          className={`h-10 w-full rounded-md border bg-background px-3 text-sm ${errorInputClass(Boolean(memberForm.formState.errors.education)) || "border-input"}`}
                        >
                          <option value="">
                            Select education
                          </option>
                          <option value="illiterate">
                            Illiterate
                          </option>
                          <option value="primary">
                            Primary School
                          </option>
                          <option value="secondary">
                            High School
                          </option>
                          <option value="puc">
                            PUC / Intermediate
                          </option>
                          <option value="diploma">
                            Diploma
                          </option>
                          <option value="graduate">
                            Graduate
                          </option>
                          <option value="post_graduate">
                            Post Graduate
                          </option>
                          <option value="doctorate">
                            Doctorate
                          </option>
                          <option value="other">
                            Other
                          </option>
                        </select>

                        <ErrorText
                          message={
                            memberForm
                              .formState
                              .errors
                              .education
                              ?.message
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label>
                          Profession *
                        </Label>

                        <select
                          {...memberForm.register(
                            "profession",
                          )}
                          className={`h-10 w-full rounded-md border bg-background px-3 text-sm ${errorInputClass(Boolean(memberForm.formState.errors.profession)) || "border-input"}`}
                        >
                          <option value="">
                            Select profession
                          </option>
                          <option value="public_service">
                            Public Service
                          </option>
                          <option value="government">
                            Government Employee
                          </option>
                          <option value="self_employed">
                            Self-Employed
                          </option>
                          <option value="business">
                            Business
                          </option>
                          <option value="doctor">
                            Doctor
                          </option>
                          <option value="advocate">
                            Advocate
                          </option>
                          <option value="engineer">
                            Engineer
                          </option>
                          <option value="teacher">
                            Teacher
                          </option>
                          <option value="journalist">
                            Journalist
                          </option>
                          <option value="police">
                            Police
                          </option>
                          <option value="student">
                            Student
                          </option>
                          <option value="farmer">
                            Farmer
                          </option>
                          <option value="other">
                            Other
                          </option>
                        </select>

                        <ErrorText
                          message={
                            memberForm
                              .formState
                              .errors
                              .profession
                              ?.message
                          }
                        />
                      </div>

                    </div>

                    <div>
                      <Label>
                        Below Poverty Line *
                      </Label>

                      <div className="mt-2 flex gap-6">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            value="yes"
                            {...memberForm.register(
                              "bpl_status",
                            )}
                            className="h-4 w-4 accent-red-700"
                          />
                          Yes
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            value="no"
                            {...memberForm.register(
                              "bpl_status",
                            )}
                            className="h-4 w-4 accent-red-700"
                          />
                          No
                        </label>
                      </div>

                      <ErrorText
                        message={
                          memberForm
                            .formState
                            .errors
                            .bpl_status
                            ?.message
                        }
                      />
                    </div>

                    <div>
                      <Label>
                        Preferred Reporting Areas *
                      </Label>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {REPORTING_AREAS.map(
                          (area) => (
                            <label
                              key={area}
                              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-xs font-medium hover:border-red-300 hover:bg-red-50"
                            >
                              <input
                                type="checkbox"
                                value={area}
                                {...memberForm.register(
                                  "reporting_areas",
                                )}
                                className="h-4 w-4 accent-red-700"
                              />

                              {area}
                            </label>
                          ),
                        )}
                      </div>

                      <ErrorText
                        message={
                          memberForm
                            .formState
                            .errors
                            .reporting_areas
                            ?.message
                        }
                      />
                    </div>

                  </div>
                </section>

                {/* ========================================================
                    04 MEMBERSHIP CATEGORY
                    ======================================================== */}

                <section>
                  <SectionHeader
                    number="04"
                    title="Membership Category"
                    subtitle="Choose the role you want to apply for"
                  />

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {MEMBERSHIP_ROLES.map(
                      (role) => {
                        const selected =
                          selectedRole ===
                          role.value;

                        return (
                          <label
                            key={
                              role.value
                            }
                            className={`cursor-pointer rounded-xl border p-4 transition ${
                              selected
                                ? "border-red-700 bg-red-50 ring-1 ring-red-700"
                                : "border-gray-200 hover:border-red-300 hover:bg-red-50/50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                value={
                                  role.value
                                }
                                {...memberForm.register(
                                  "requested_role",
                                )}
                                className="mt-1 h-4 w-4 accent-red-700"
                              />

                              <div>
                                <p className="text-sm font-black text-gray-900">
                                  {
                                    role.label
                                  }
                                </p>

                                <p className="mt-1 text-[11px] text-gray-500">
                                  {
                                    role.description
                                  }
                                </p>
                              </div>
                            </div>
                          </label>
                        );
                      },
                    )}
                  </div>

                  {selectedRole ===
                    "other" && (
                    <div className="mt-4 space-y-1.5">
                      <Label>
                        Specify Role *
                      </Label>

                      <Input
                        placeholder="Enter your requested role"
                        {...memberForm.register(
                          "other_role",
                        )}
                      
                      className={errorInputClass(Boolean(memberForm.formState.errors.other_role))}
                      />

                      <ErrorText
                        message={
                          memberForm
                            .formState
                            .errors
                            .other_role
                            ?.message
                        }
                      />
                    </div>
                  )}
                </section>

                {/* ========================================================
                    05 DOCUMENTS
                    ======================================================== */}

                <section>
                  <SectionHeader
                    number="05"
                    title="Upload Documents"
                    subtitle="Upload clear and valid documents"
                  />

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <UploadBox
                      label="Selfie Photograph"
                      required
                      accept="image/png,image/jpeg"
                      file={
                        selfieFile
                      }
                      error={fileErrors.selfie}
                      onChange={(file) => {
                        setSelfieFile(file);
                        setFileErrors((prev) => ({ ...prev, selfie: undefined }));
                        setMemberError(null);
                      }}
                    />

                    <UploadBox
                      label="Aadhaar Card"
                      accept="image/png,image/jpeg,application/pdf"
                      file={
                        aadhaarFile
                      }
                      error={fileErrors.aadhaar}
                      onChange={(file) => {
                        setAadhaarFile(file);
                        setFileErrors((prev) => ({ ...prev, aadhaar: undefined }));
                        setMemberError(null);
                      }}
                    />

                    <UploadBox
                      label="PAN Card"
                      accept="image/png,image/jpeg,application/pdf"
                      file={
                        panFile
                      }
                      error={fileErrors.pan}
                      onChange={(file) => {
                        setPanFile(file);
                        setFileErrors((prev) => ({ ...prev, pan: undefined }));
                        setMemberError(null);
                      }}
                    />

                    <UploadBox
                      label="Identity Proof"
                      required
                      accept="image/png,image/jpeg,application/pdf"
                      file={
                        identityFile
                      }
                      error={fileErrors.identity}
                      onChange={(file) => {
                        setIdentityFile(file);
                        setFileErrors((prev) => ({ ...prev, identity: undefined }));
                        setMemberError(null);
                      }}
                    />

                    <UploadBox
                      label="Supporting Documents"
                      accept="image/png,image/jpeg,application/pdf"
                      file={
                        supportingFiles[0] ??
                        null
                      }
                      error={fileErrors.supporting}
                      onChange={(file) => {
                        setSupportingFiles(file ? [file] : []);
                        setFileErrors((prev) => ({ ...prev, supporting: undefined }));
                        setMemberError(null);
                      }}
                    />
                  </div>
                </section>

                {/* ========================================================
                    06 DECLARATION
                    ======================================================== */}

                <section>
                  <SectionHeader
                    number="06"
                    title="Declaration & Oath"
                  />

                  <div
                    className={`rounded-xl border bg-gray-50 p-5 ${
                      memberForm.formState.errors.declaration_confirmed
                        ? "border-red-600 ring-1 ring-red-100"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="space-y-3 text-sm leading-6 text-gray-600">
                      <p>
                        I hereby declare that
                        all the information
                        provided in this
                        application is true,
                        correct and complete
                        to the best of my
                        knowledge.
                      </p>

                      <p>
                        I accept full
                        responsibility for
                        the accuracy,
                        authenticity and
                        legality of the
                        information submitted
                        by me.
                      </p>

                      <p>
                        I understand that false
                        or misleading
                        information may result
                        in rejection of my
                        application and further
                        action under applicable
                        law.
                      </p>
                    </div>

                    <label className="mt-5 flex cursor-pointer items-start gap-3 border-t border-gray-200 pt-4 text-sm font-semibold">
                      <input
                        type="checkbox"
                        {...memberForm.register(
                          "declaration_confirmed",
                        )}
                        className="mt-1 h-4 w-4 accent-red-700"
                      />

                      <span>
                        I have read, understood
                        and agree to the
                        Declaration & Oath.
                      </span>
                    </label>

                    <ErrorText
                      message={
                        memberForm
                          .formState
                          .errors
                          .declaration_confirmed
                          ?.message
                      }
                    />
                  </div>
                </section>

                {/* ========================================================
                    07 TERMS
                    ======================================================== */}

                <section>
                  <SectionHeader
                    number="07"
                    title="Terms & Conditions"
                  />

                  <div
                    className={`space-y-4 rounded-xl border bg-gray-50 p-5 ${
                      memberForm.formState.errors.terms_confirmed ||
                      memberForm.formState.errors.privacy_confirmed
                        ? "border-red-600 ring-1 ring-red-100"
                        : "border-gray-200"
                    }`}
                  >

                    <label className="flex cursor-pointer items-start gap-3 text-sm">
                      <input
                        type="checkbox"
                        {...memberForm.register(
                          "terms_confirmed",
                        )}
                        className="mt-1 h-4 w-4 accent-red-700"
                      />

                      <span>
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="font-bold text-red-700 hover:underline"
                        >
                          Terms of Service
                        </Link>
                        .
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3 text-sm">
                      <input
                        type="checkbox"
                        {...memberForm.register(
                          "privacy_confirmed",
                        )}
                        className="mt-1 h-4 w-4 accent-red-700"
                      />

                      <span>
                        I agree to the{" "}
                        <Link
                          href="/privacy"
                          className="font-bold text-red-700 hover:underline"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3 text-sm">
                      <input
                        type="checkbox"
                        {...memberForm.register(
                          "communication_consent",
                        )}
                        className="mt-1 h-4 w-4 accent-red-700"
                      />

                      <span>
                        I consent to receive
                        important communications
                        from War of Justice.
                      </span>
                    </label>

                    <ErrorText
                      message={
                        memberForm
                          .formState
                          .errors
                          .terms_confirmed
                          ?.message
                      }
                    />

                    <ErrorText
                      message={
                        memberForm
                          .formState
                          .errors
                          .privacy_confirmed
                          ?.message
                      }
                    />

                  </div>
                </section>

                {/* ========================================================
                    SUBMIT
                    ======================================================== */}

                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                  <p className="mx-auto max-w-2xl text-xs leading-5 text-gray-600">
                    By submitting this
                    application, you confirm
                    that the information provided
                    is accurate and complete.
                    Your application will be
                    reviewed before approval.
                  </p>

                  {/* SUBMISSION ERROR */}

                  {memberError && (
                    <div
                      role="alert"
                      className="mt-5 rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-left text-sm font-semibold text-red-700"
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 font-black">
                          ⚠
                        </span>

                        <span>
                          {memberError}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* SUBMISSION SUCCESS */}

                  {memberSuccess && (
                    <div
                      role="status"
                      className="mt-5 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-left text-sm font-semibold text-green-700"
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                        <span>
                          {memberSuccess}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={
                      memberSubmitting
                    }
                    className="mt-5 w-full bg-red-700 font-black hover:bg-red-800 sm:max-w-md"
                  >
                    {memberSubmitting
                      ? "Submitting Application..."
                      : "Submit Membership Application"}

                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>

                  <p className="mt-3 text-[10px] text-gray-500">
                    Secure submission · Your
                    information is handled
                    confidentially
                  </p>
                </div>

              </form>
          </section>
        )}

        {/* ================================================================
            LOGIN
            ================================================================ */}

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-red-700 hover:underline"
          >
            Sign in
          </Link>
        </p>

      </div>
    </main>
  );
}