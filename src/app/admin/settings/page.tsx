"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

import { settingsApi } from "@/lib/api/settings";
import { authApi } from "@/lib/api/auth";

/* =========================================================
   SITE SETTINGS FIELDS
========================================================= */

const FIELDS: {
  key: string;
  label: string;
  type: "text" | "textarea";
}[] = [
  {
    key: "site_name",
    label: "Site Name",
    type: "text",
  },
  {
    key: "logo_url",
    label: "Logo URL",
    type: "text",
  },
  {
    key: "seo_default_title",
    label: "Default SEO Title",
    type: "text",
  },
  {
    key: "seo_default_description",
    label: "Default SEO Description",
    type: "textarea",
  },
  {
    key: "social_twitter",
    label: "Twitter/X URL",
    type: "text",
  },
  {
    key: "social_facebook",
    label: "Facebook URL",
    type: "text",
  },
  {
    key: "social_instagram",
    label: "Instagram URL",
    type: "text",
  },
  {
    key: "newsletter_provider_key",
    label: "Newsletter Provider API Key",
    type: "text",
  },
];

/* =========================================================
   PASSWORD FIELD
========================================================= */

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  show,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="pr-11"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
        >
          {show ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();

  /* =======================================================
     SITE SETTINGS
  ======================================================= */

  const {
    data: settings,
    isLoading,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.list(),
  });

  const [values, setValues] = useState<Record<string, string>>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;

    const map: Record<string, string> = {};

    for (const s of settings) {
      map[s.key] =
        typeof s.value === "string"
          ? s.value
          : JSON.stringify(s.value ?? "");
    }

    setValues((prev) => ({
      ...map,
      ...prev,
    }));
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (key: string) =>
      settingsApi.upsert(key, values[key] ?? ""),

    onSuccess: (_data, key) => {
      queryClient.invalidateQueries({
        queryKey: ["settings"],
      });

      setSavedKey(key);

      setTimeout(() => {
        setSavedKey(null);
      }, 1500);
    },
  });

  /* =======================================================
     CHANGE PASSWORD
  ======================================================= */

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState<string | null>(null);

  const [passwordSuccess, setPasswordSuccess] =
    useState<string | null>(null);

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      }),

    onSuccess: (data) => {
      setPasswordError(null);

      setPasswordSuccess(
        data.message ||
          "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setPasswordSuccess(null);
      }, 4000);
    },

    onError: (error: any) => {
      let message =
        "Unable to change password. Please try again.";

      if (error?.response?.data) {
        const data = error.response.data;

        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (
          typeof data.current_password === "string"
        ) {
          message = data.current_password;
        } else if (
          Array.isArray(data.current_password)
        ) {
          message = data.current_password[0];
        } else if (
          typeof data.new_password === "string"
        ) {
          message = data.new_password;
        } else if (
          Array.isArray(data.new_password)
        ) {
          message = data.new_password[0];
        }
      }

      setPasswordSuccess(null);
      setPasswordError(message);
    },
  });

  /* =======================================================
     PASSWORD SUBMIT
  ======================================================= */

  const handleChangePassword = () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword.trim()) {
      setPasswordError(
        "Please enter your current password."
      );
      return;
    }

    if (!newPassword.trim()) {
      setPasswordError(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirmation password do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    changePasswordMutation.mutate();
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <div className="max-w-2xl">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="max-w-2xl space-y-6 pb-10">
      {/* ===================================================
          PAGE HEADER
      ================================================== */}

      <div>
        <h2 className="text-xl font-bold">
          Site Settings
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Only Super Admins can save changes here —
          the backend independently enforces this.
        </p>
      </div>

      {/* ===================================================
          GENERAL SETTINGS
      ================================================== */}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            General
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {FIELDS.map((field) => (
            <div
              key={field.key}
              className="space-y-1.5"
            >
              <Label htmlFor={field.key}>
                {field.label}
              </Label>

              <div className="flex gap-2">
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.key}
                    rows={2}
                    value={values[field.key] ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        [field.key]:
                          e.target.value,
                      }))
                    }
                  />
                ) : (
                  <Input
                    id={field.key}
                    value={values[field.key] ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        [field.key]:
                          e.target.value,
                      }))
                    }
                  />
                )}

                <Button
                  variant="outline"
                  disabled={saveMutation.isPending}
                  onClick={() =>
                    saveMutation.mutate(field.key)
                  }
                >
                  {savedKey === field.key
                    ? "Saved"
                    : "Save"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ===================================================
          SECURITY
      ================================================== */}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100">
              <Lock className="h-4 w-4 text-gray-700" />
            </div>

            <div>
              <CardTitle className="text-sm">
                Security
              </CardTitle>

              <p className="mt-1 text-xs text-muted-foreground">
                Manage your administrator password.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Current Password */}

          <PasswordField
            id="current-password"
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            show={showCurrentPassword}
            onToggle={() =>
              setShowCurrentPassword(
                (value) => !value
              )
            }
          />

          {/* New Password */}

          <PasswordField
            id="new-password"
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            show={showNewPassword}
            onToggle={() =>
              setShowNewPassword(
                (value) => !value
              )
            }
          />

          {/* Confirm Password */}

          <PasswordField
            id="confirm-password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            show={showConfirmPassword}
            onToggle={() =>
              setShowConfirmPassword(
                (value) => !value
              )
            }
          />

          {/* Password requirement */}

          <p className="text-xs text-muted-foreground">
            Use at least 8 characters. Django's
            password validation rules will also be
            applied by the server.
          </p>

          {/* Error */}

          {passwordError && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{passwordError}</span>
            </div>
          )}

          {/* Success */}

          {passwordSuccess && (
            <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{passwordSuccess}</span>
            </div>
          )}

          {/* Button */}

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              disabled={
                changePasswordMutation.isPending
              }
              onClick={handleChangePassword}
            >
              {changePasswordMutation.isPending
                ? "Changing Password..."
                : "Change Password"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}