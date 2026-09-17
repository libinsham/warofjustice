"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  X,
  Check,
  XCircle,
  Mail,
  Phone,
  CalendarDays,
  User,
  Globe,
  Newspaper,
  MessageSquare,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

type SubscriberStatus = "pending" | "approved" | "rejected";

interface ApiSubscriber {
  id: number;
  application_id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp_number?: string;
  website?: string;
  channels_confirmed?: string[];
  declaration_confirmed?: boolean;
  status: SubscriberStatus;
  created_at: string;
}

interface Subscriber {
  id: string;
  applicationId: string;
  name: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  location: string;
  submittedAt: string;
  status: SubscriberStatus;
  interests: string[];
  reason: string;
  newsletter: boolean;
  website?: string;
}

/*
|--------------------------------------------------------------------------
| API CONFIGURATION
|--------------------------------------------------------------------------
*/

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.warofjustice.news/api/v1";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  /*
   * Try the common token names used by the existing frontend.
   * If your login system uses one of these, it will automatically work.
   */
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("access") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("access") ||
    sessionStorage.getItem("token")
  );
}

function formatDate(dateString: string): string {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getStatusClasses(status: SubscriberStatus) {
  switch (status) {
    case "approved":
      return "bg-green-50 text-green-700 border-green-200";

    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

function getStatusLabel(status: SubscriberStatus) {
  switch (status) {
    case "approved":
      return "Approved";

    case "rejected":
      return "Rejected";

    default:
      return "Pending";
  }
}

/*
|--------------------------------------------------------------------------
| API → FRONTEND MAPPING
|--------------------------------------------------------------------------
*/

function mapApiSubscriber(item: ApiSubscriber): Subscriber {
  return {
    id: String(item.id),

    applicationId: item.application_id,

    name: item.name || "-",

    email: item.email || "-",

    phone: item.phone || "-",

    whatsappNumber: item.whatsapp_number || "-",

    /*
     * Your current backend response does not show a location field.
     * Therefore we don't invent one.
     */
    location: "-",

    submittedAt: formatDate(item.created_at),

    status: item.status,

    interests: Array.isArray(item.channels_confirmed)
      ? item.channels_confirmed
      : [],

    /*
     * Your backend response currently does not expose an application
     * reason field, so don't display fake text.
     */
    reason: "",

    newsletter: Array.isArray(item.channels_confirmed)
      ? item.channels_confirmed.includes("newsletter")
      : false,

    website: item.website || "",
  };
}

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  const [selectedSubscriber, setSelectedSubscriber] =
    useState<Subscriber | null>(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "all" | SubscriberStatus
  >("all");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD SUBSCRIBERS
  |--------------------------------------------------------------------------
  */

  const loadSubscribers = useCallback(async () => {
    try {
      setError("");

      const token = getAccessToken();

      const headers: HeadersInit = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/auth/subscriber-applications/`,
        {
          method: "GET",
          headers,
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;

        try {
          const errorData = await response.json();

          if (errorData?.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      /*
       * Supports both:
       *
       * [
       *   {...},
       *   {...}
       * ]
       *
       * and DRF pagination:
       *
       * {
       *   "count": 3,
       *   "results": [...]
       * }
       */

      const apiResults: ApiSubscriber[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      const mappedSubscribers = apiResults.map(mapApiSubscriber);

      setSubscribers(mappedSubscribers);
    } catch (err) {
      console.error("Failed to load subscribers:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load subscriber applications."
      );

      setSubscribers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  /*
  |--------------------------------------------------------------------------
  | REFRESH
  |--------------------------------------------------------------------------
  */

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSubscribers();
  };

  /*
  |--------------------------------------------------------------------------
  | FILTERING
  |--------------------------------------------------------------------------
  */

  const filteredSubscribers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subscribers.filter((subscriber) => {
      const matchesSearch =
        !query ||
        subscriber.name.toLowerCase().includes(query) ||
        subscriber.email.toLowerCase().includes(query) ||
        subscriber.applicationId.toLowerCase().includes(query) ||
        subscriber.phone.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        subscriber.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subscribers, search, statusFilter]);

  /*
  |--------------------------------------------------------------------------
  | STATISTICS
  |--------------------------------------------------------------------------
  */

  const totalCount = subscribers.length;

  const pendingCount = subscribers.filter(
    (subscriber) => subscriber.status === "pending"
  ).length;

  const approvedCount = subscribers.filter(
    (subscriber) => subscriber.status === "approved"
  ).length;

  const rejectedCount = subscribers.filter(
    (subscriber) => subscriber.status === "rejected"
  ).length;

  /*
  |--------------------------------------------------------------------------
  | LOCAL STATUS UPDATE
  |
  | IMPORTANT:
  | Your current Django urls.py only exposes the subscriber application
  | LIST endpoint. There is currently no approve/reject URL.
  |
  | Therefore these buttons should NOT pretend to update the database.
  |--------------------------------------------------------------------------
  */

  const closeDrawer = () => {
    setSelectedSubscriber(null);
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="border-b border-gray-200 bg-white">
        <div className="px-6 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white">
                  <Mail size={20} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Subscribers
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">
                    Manage subscriber applications and approvals.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />

                Refresh
              </button>

              <div className="text-sm text-gray-500">
                {filteredSubscribers.length} application
                {filteredSubscribers.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          CONTENT
      ========================================================= */}

      <div className="p-6">
        {/* =======================================================
            ERROR
        ======================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />

            <div>
              <p className="font-semibold">
                Unable to load subscribers
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>

              <button
                type="button"
                onClick={loadSubscribers}
                className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* =======================================================
            STATISTICS
        ======================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Subscribers"
            value={totalCount}
            description="All applications"
          />

          <StatCard
            title="Pending Review"
            value={pendingCount}
            description="Awaiting approval"
          />

          <StatCard
            title="Approved"
            value={approvedCount}
            description="Active subscribers"
          />

          <StatCard
            title="Rejected"
            value={rejectedCount}
            description="Rejected applications"
          />
        </div>

        {/* =======================================================
            FILTERS
        ======================================================= */}

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search by name, email, phone or application ID..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter
                size={17}
                className="text-gray-500"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "all"
                      | SubscriberStatus
                  )
                }
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                <option value="all">
                  All Status
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* =======================================================
            TABLE
        ======================================================= */}

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Applicant
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Application ID
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Submitted
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Loader2
                          size={30}
                          className="animate-spin text-red-600"
                        />

                        <p className="mt-3 text-sm font-medium text-gray-600">
                          Loading subscribers...
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* =================================================
                    DATA
                ================================================= */}

                {!loading &&
                  filteredSubscribers.map((subscriber) => (
                    <tr
                      key={subscriber.id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Applicant */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                            {getInitials(
                              subscriber.name
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {subscriber.name}
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {subscriber.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Application ID */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm text-gray-700">
                          {subscriber.applicationId}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600">
                          {subscriber.phone}
                        </span>
                      </td>

                      {/* Submitted */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600">
                          {subscriber.submittedAt}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            subscriber.status
                          )}`}
                        >
                          {getStatusLabel(
                            subscriber.status
                          )}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedSubscriber(
                              subscriber
                            )
                          }
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-500 hover:text-red-600"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}

                {/* =================================================
                    EMPTY
                ================================================= */}

                {!loading &&
                  filteredSubscribers.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-16 text-center"
                      >
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <Search size={20} />
                          </div>

                          <h3 className="mt-4 text-sm font-semibold text-gray-900">
                            No subscribers found
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            Try changing your search or
                            filter.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================
          REVIEW DRAWER
      ========================================================= */}

      {selectedSubscriber && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close review panel"
            onClick={closeDrawer}
            className="absolute inset-0 bg-black/40"
          />

          {/* Drawer */}
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
            {/* ===================================================
                DRAWER HEADER
            =================================================== */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                  Subscriber Application
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  Review Application
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* ===================================================
                DRAWER CONTENT
            =================================================== */}

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-lg font-bold text-red-600">
                  {getInitials(
                    selectedSubscriber.name
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedSubscriber.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {selectedSubscriber.applicationId}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={<Mail size={16} />}
                  label="Email"
                  value={
                    selectedSubscriber.email
                  }
                />

                <InfoItem
                  icon={<Phone size={16} />}
                  label="Phone"
                  value={
                    selectedSubscriber.phone
                  }
                />

                <InfoItem
                  icon={<Phone size={16} />}
                  label="WhatsApp"
                  value={
                    selectedSubscriber.whatsappNumber
                  }
                />

                <InfoItem
                  icon={<CalendarDays size={16} />}
                  label="Submitted"
                  value={
                    selectedSubscriber.submittedAt
                  }
                />

                <InfoItem
                  icon={<User size={16} />}
                  label="Current Status"
                  value={getStatusLabel(
                    selectedSubscriber.status
                  )}
                />

                <InfoItem
                  icon={<Newspaper size={16} />}
                  label="Newsletter"
                  value={
                    selectedSubscriber.newsletter
                      ? "Subscribed"
                      : "Not subscribed"
                  }
                />
              </div>

              {/* Interests / Channels */}
              <div className="mt-7">
                <h4 className="text-sm font-semibold text-gray-900">
                  Confirmed Channels
                </h4>

                {selectedSubscriber.interests.length >
                0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedSubscriber.interests.map(
                      (interest) => (
                        <span
                          key={interest}
                          className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium capitalize text-gray-700"
                        >
                          {interest}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">
                    No channels provided.
                  </p>
                )}
              </div>

              {/* Website */}
              {selectedSubscriber.website && (
                <div className="mt-7">
                  <div className="flex items-center gap-2">
                    <Globe
                      size={17}
                      className="text-red-600"
                    />

                    <h4 className="text-sm font-semibold text-gray-900">
                      Website
                    </h4>
                  </div>

                  <p className="mt-2 break-words text-sm text-gray-600">
                    {selectedSubscriber.website}
                  </p>
                </div>
              )}

              {/* Application Reason */}
              {selectedSubscriber.reason && (
                <div className="mt-7">
                  <div className="flex items-center gap-2">
                    <MessageSquare
                      size={17}
                      className="text-red-600"
                    />

                    <h4 className="text-sm font-semibold text-gray-900">
                      Application Reason
                    </h4>
                  </div>

                  <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm leading-6 text-gray-600">
                      {selectedSubscriber.reason}
                    </p>
                  </div>
                </div>
              )}

              {/* Current Status */}
              <div className="mt-7">
                <h4 className="text-sm font-semibold text-gray-900">
                  Application Status
                </h4>

                <div className="mt-3">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                      selectedSubscriber.status
                    )}`}
                  >
                    {getStatusLabel(
                      selectedSubscriber.status
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* ===================================================
                DRAWER FOOTER
            =================================================== */}

            <div className="border-t border-gray-200 bg-white px-6 py-5">
              {selectedSubscriber.status ===
              "pending" ? (
                <div>
                  <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                    Approval/rejection API is not yet
                    configured in the current Django
                    URLs. These buttons will be connected
                    after the backend approve/reject
                    endpoints are added.
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled
                      className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 opacity-60"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>

                    <button
                      type="button"
                      disabled
                      className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white opacity-60"
                    >
                      <Check size={18} />
                      Approve
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Close
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-3xl font-bold text-gray-900">
          {value}
        </p>

        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
          {description}
        </span>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| INFO ITEM
|--------------------------------------------------------------------------
*/

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}

        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 break-words text-sm font-medium text-gray-800">
        {value}
      </p>
    </div>
  );
}