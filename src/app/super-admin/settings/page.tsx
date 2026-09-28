
"use client";

import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  AlertCircle,
  UserRound,
  Save,
} from "lucide-react";

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
   API ERROR HELPER
========================================================= */

function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const responseData = (
    error as {
      response?: {
        data?: Record<string, unknown>;
      };
    } | null
  )?.response?.data;

  if (responseData) {
    const candidates = [
      responseData.detail,
      responseData.username,
      responseData.current_password,
      responseData.new_password,
      responseData.message,
      responseData.error,
    ];

    for (const candidate of candidates) {
      if (
        typeof candidate === "string" &&
        candidate.trim()
      ) {
        return candidate;
      }

      if (
        Array.isArray(candidate) &&
        typeof candidate[0] === "string"
      ) {
        return candidate[0];
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

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
          aria-label={
            show ? `Hide ${label}` : `Show ${label}`
          }
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

export default function SuperAdminSettingsPage() {
  const queryClient = useQueryClient();

  /* =======================================================
     CURRENT ADMIN ACCOUNT
  ======================================================= */

  const {
    data: currentUser,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.me(),
    staleTime: 60_000,
  });

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] =
    useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] =
    useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.username !== undefined) {
      setUsername(currentUser.username);
    }
  }, [currentUser?.username]);

  const usernameMutation = useMutation({
    mutationFn: () =>
      authApi.updateProfile({
        username: username.trim(),
      }),

    onSuccess: async (updatedUser) => {
      setUsername(updatedUser.username);
      setUsernameError(null);
      setUsernameSuccess("Username updated successfully.");

      queryClient.setQueryData(
        ["auth", "me"],
        updatedUser,
      );

      await queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });
    },

    onError: (error: unknown) => {
      setUsernameSuccess(null);
      setUsernameError(
        getApiErrorMessage(
          error,
          "Unable to update username. Please try again.",
        ),
      );
    },
  });

  const handleUpdateUsername = () => {
    setUsernameError(null);
    setUsernameSuccess(null);

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setUsernameError("Please enter a username.");
      return;
    }

    if (trimmedUsername.length > 150) {
      setUsernameError(
        "Username cannot exceed 150 characters.",
      );
      return;
    }

    if (
      currentUser &&
      trimmedUsername === currentUser.username
    ) {
      setUsernameError(
        "Please enter a different username.",
      );
      return;
    }

    usernameMutation.mutate();
  };

  /* =======================================================
     SITE SETTINGS
  ======================================================= */

  const {
    data: settings,
    isLoading: isSettingsLoading,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.list(),
  });

  const [values, setValues] =
    useState<Record<string, string>>({});
  const [savedKey, setSavedKey] =
    useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;

    const map: Record<string, string> = {};

    for (const setting of settings) {
      map[setting.key] =
        typeof setting.value === "string"
          ? setting.value
          : JSON.stringify(setting.value ?? "");
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
      }, 2000);
    },
  });

  /* =======================================================
     CHANGE PASSWORD
  ======================================================= */

  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

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
        data.message || "Password changed successfully.",
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },

    onError: (error: unknown) => {
      setPasswordSuccess(null);
      setPasswordError(
        getApiErrorMessage(
          error,
          "Unable to change password. Please try again.",
        ),
      );
    },
  });

  const handleChangePassword = () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword.trim()) {
      setPasswordError(
        "Please enter your current password.",
      );
      return;
    }

    if (!newPassword.trim()) {
      setPasswordError(
        "Please enter a new password.",
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirmation password do not match.",
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from your current password.",
      );
      return;
    }

    changePasswordMutation.mutate();
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (isSettingsLoading) {
    return (
      <div className="max-w-3xl space-y-6 pb-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="w-full max-w-4xl space-y-6 pb-10">
      {/* PAGE HEADER */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Super Admin Settings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your administrator account, website
          configuration and security.
        </p>
      </div>

      {/* ===================================================
          ACCOUNT / USERNAME
      ================================================== */}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <CardTitle className="text-sm">
                Administrator Account
              </CardTitle>

              <p className="mt-1 text-xs text-muted-foreground">
                Update the username of your signed-in account.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {isUserLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : isUserError ? (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {getApiErrorMessage(
                  userError,
                  "Unable to load the administrator account.",
                )}
              </span>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="admin-email">
                  Registered Email
                </Label>

                <Input
                  id="admin-email"
                  value={currentUser?.email ?? ""}
                  readOnly
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-username">
                  Username
                </Label>

                <Input
                  id="admin-username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameError(null);
                    setUsernameSuccess(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleUpdateUsername();
                    }
                  }}
                  autoComplete="username"
                  maxLength={150}
                  placeholder="Enter your username"
                  disabled={usernameMutation.isPending}
                />

                <p className="text-xs text-muted-foreground">
                  Enter a unique username. The server validates
                  username rules and availability.
                </p>
              </div>

              {usernameError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{usernameError}</span>
                </div>
              )}

              {usernameSuccess && (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{usernameSuccess}</span>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={
                    usernameMutation.isPending ||
                    !username.trim() ||
                    username.trim() === currentUser?.username
                  }
                  onClick={handleUpdateUsername}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {usernameMutation.isPending
                    ? "Updating Username..."
                    : "Update Username"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ===================================================
          GENERAL SETTINGS
      ================================================== */}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            General Settings
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Configure the website's general information and
            default metadata.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          {FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={field.key}>
                {field.label}
              </Label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="min-w-0 flex-1">
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.key}
                      rows={3}
                      value={values[field.key] ?? ""}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          [field.key]: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <Input
                      id={field.key}
                      type={
                        field.key === "newsletter_provider_key"
                          ? "password"
                          : "text"
                      }
                      value={values[field.key] ?? ""}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          [field.key]: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={saveMutation.isPending}
                  onClick={() => saveMutation.mutate(field.key)}
                >
                  {savedKey === field.key ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>

              {saveMutation.isError && (
                <p className="text-xs text-red-600">
                  Unable to save this setting. Please try again.
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ===================================================
          SECURITY / CHANGE PASSWORD
      ================================================== */}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Lock className="h-5 w-5 text-gray-700" />
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
          <PasswordField
            id="current-password"
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            show={showCurrentPassword}
            onToggle={() =>
              setShowCurrentPassword((value) => !value)
            }
          />

          <PasswordField
            id="new-password"
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            show={showNewPassword}
            onToggle={() =>
              setShowNewPassword((value) => !value)
            }
          />

          <PasswordField
            id="confirm-password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            show={showConfirmPassword}
            onToggle={() =>
              setShowConfirmPassword((value) => !value)
            }
          />

          <p className="text-xs text-muted-foreground">
            Use at least 8 characters. Django's password
            validation rules will also be applied by the server.
          </p>

          {passwordError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              disabled={changePasswordMutation.isPending}
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