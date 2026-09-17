"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileText,
  Loader2,
  LogOut,
  Mail,
  Settings,
  UserCircle,
} from "lucide-react";

import { authApi } from "@/lib/api/auth";

type SubscriberApplication = {
  application_id?: string;
  channels_confirmed?: string[];
  created_at?: string;
};

type SubscriberUser = {
  id: number;
  email: string;
  username: string;
  status?: "active" | "suspended" | "pending";
  profile?: {
    full_name?: string;
    phone_number?: string;
    whatsapp_number?: string;
    website?: string;
    avatar_url?: string;
  } | null;
  subscriber_application?: SubscriberApplication | null;
};

type EMagazine = {
  id: string;
  title: string;
  issue: string;
  publishedAt: string;
  description?: string;
  coverImage?: string;
  pdfUrl?: string;
};

/*
 * IMPORTANT:
 * The current project files do not contain a confirmed e-Magazine API/model.
 * Therefore this list is intentionally empty instead of inventing magazine
 * records. Once the backend e-Magazine endpoint is available, replace this
 * constant with an API call.
 */
const EMAGAZINES: EMagazine[] = [];

function formatDate(value?: string): string {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SubscriberDashboardPage() {
  const [user, setUser] = useState<SubscriberUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setError("");

        const data = (await authApi.me()) as unknown as SubscriberUser;

        if (!mounted) return;

        setUser(data);
      } catch (err) {
        console.error("Failed to load subscriber dashboard:", err);

        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your subscriber dashboard.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      window.location.href = "/login";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="animate-spin" size={22} />
            <span>Loading subscriber dashboard...</span>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto flex min-h-screen max-w-2xl items-center px-6">
          <div className="w-full rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">
              Unable to load dashboard
            </h1>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Go to Login
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const fullName =
    user?.profile?.full_name?.trim() ||
    user?.username ||
    "Subscriber";

  const applicationId =
    user?.subscriber_application?.application_id || "Not available";

  const status =
    user?.status === "suspended"
      ? "Suspended"
      : "Active";

  const statusIsActive = user?.status !== "suspended";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <Link
              href="/"
              className="text-xl font-extrabold tracking-tight text-gray-900"
            >
              WAR OF <span className="text-red-600">JUSTICE</span>
            </Link>

            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-400">
              Subscriber Dashboard
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/subscriber/profile"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <UserCircle size={17} />
              Profile
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:text-red-600"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <section className="rounded-3xl bg-gray-900 p-7 text-white shadow-sm md:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">
                Welcome back
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                {fullName}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
                Your War of Justice subscriber account is ready. Access your
                subscriber information and e-Magazine collection from here.
              </p>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                statusIsActive
                  ? "bg-green-500/15 text-green-300"
                  : "bg-red-500/15 text-red-300"
              }`}
            >
              <CheckCircle2 size={17} />
              Account {status}
            </div>
          </div>
        </section>

        {/* Account summary */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <SummaryCard
            icon={<CheckCircle2 size={19} />}
            label="Account Status"
            value={status}
            valueClassName={
              statusIsActive ? "text-green-700" : "text-red-700"
            }
          />

          <SummaryCard
            icon={<FileText size={19} />}
            label="Subscriber / Application ID"
            value={applicationId}
            mono
          />

          <SummaryCard
            icon={<CalendarDays size={19} />}
            label="Joined"
            value={formatDate(
              user?.subscriber_application?.created_at,
            )}
          />
        </section>

        {/* Contact + quick actions */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <UserCircle size={20} className="text-red-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Account Information
              </h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoRow
                icon={<UserCircle size={17} />}
                label="Full Name"
                value={fullName}
              />

              <InfoRow
                icon={<Mail size={17} />}
                label="Email"
                value={user?.email || "-"}
              />

              <InfoRow
                icon={<UserCircle size={17} />}
                label="Username"
                value={user?.username || "-"}
              />

              <InfoRow
                icon={<UserCircle size={17} />}
                label="Phone"
                value={user?.profile?.phone_number || "-"}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Settings size={19} className="text-red-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Quick Access
              </h2>
            </div>

            <div className="mt-5 space-y-3">
              <QuickAction
                href="#emagazines"
                icon={<BookOpen size={18} />}
                title="e-Magazine Library"
                description="Read available subscriber issues"
              />

              <QuickAction
                href="/subscriber/profile"
                icon={<UserCircle size={18} />}
                title="Profile"
                description="Manage your subscriber details"
              />

              <QuickAction
                href="/"
                icon={<ArrowRight size={18} />}
                title="Back to War of Justice"
                description="Return to the public website"
              />
            </div>
          </div>
        </section>

        {/* e-Magazine */}
        <section id="emagazines" className="mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen size={21} className="text-red-600" />

                <h2 className="text-2xl font-bold text-gray-900">
                  e-Magazine Library
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Subscriber-access e-Magazine issues.
              </p>
            </div>
          </div>

          {EMAGAZINES.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <BookOpen size={24} />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No e-Magazines published yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                The e-Magazine section is ready. Once the e-Magazine
                publishing API is connected, published issues will appear here
                automatically.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {EMAGAZINES.map((magazine) => (
                <article
                  key={magazine.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  {magazine.coverImage ? (
                    <img
                      src={magazine.coverImage}
                      alt={magazine.title}
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-gray-100 text-gray-400">
                      <BookOpen size={42} />
                    </div>
                  )}

                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                      {magazine.issue}
                    </p>

                    <h3 className="mt-2 text-lg font-bold text-gray-900">
                      {magazine.title}
                    </h3>

                    {magazine.description && (
                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {magazine.description}
                      </p>
                    )}

                    <p className="mt-3 text-xs text-gray-400">
                      Published {formatDate(magazine.publishedAt)}
                    </p>

                    {magazine.pdfUrl && (
                      <a
                        href={magazine.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        Read / Download
                        <ArrowRight size={16} />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  mono = false,
  valueClassName = "text-gray-900",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p
        className={`mt-3 text-lg font-bold ${valueClassName} ${
          mono ? "font-mono text-base" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition hover:border-red-200 hover:bg-red-50/40"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        </div>
      </div>

      <ArrowRight size={17} className="text-gray-400" />
    </Link>
  );
}
