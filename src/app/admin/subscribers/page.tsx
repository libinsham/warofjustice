"use client";

import { useMemo, useState } from "react";
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
} from "lucide-react";

type SubscriberStatus = "pending" | "approved" | "rejected";

interface Subscriber {
  id: string;
  applicationId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  submittedAt: string;
  status: SubscriberStatus;
  interests: string[];
  reason: string;
  newsletter: boolean;
  website?: string;
}

const INITIAL_SUBSCRIBERS: Subscriber[] = [
  {
    id: "1",
    applicationId: "WOJ-2026-84083",
    name: "Arun Kumar",
    email: "arun@example.com",
    phone: "+91 98765 43210",
    location: "Chennai, Tamil Nadu",
    submittedAt: "14 Sep 2026",
    status: "pending",
    interests: ["Politics", "Technology", "World"],
    reason:
      "I would like to stay updated with independent journalism and receive important news updates from War of Justice.",
    newsletter: true,
    website: "",
  },
  {
    id: "2",
    applicationId: "WOJ-2026-84081",
    name: "Priya Nair",
    email: "priya@example.com",
    phone: "+91 91234 56789",
    location: "Kochi, Kerala",
    submittedAt: "13 Sep 2026",
    status: "approved",
    interests: ["Business", "Technology"],
    reason:
      "Interested in receiving curated news and analysis from War of Justice.",
    newsletter: true,
    website: "",
  },
  {
    id: "3",
    applicationId: "WOJ-2026-84076",
    name: "Rahul Das",
    email: "rahul@example.com",
    phone: "+91 99887 66554",
    location: "Bengaluru, Karnataka",
    submittedAt: "12 Sep 2026",
    status: "rejected",
    interests: ["Sports"],
    reason: "General subscription request.",
    newsletter: false,
    website: "",
  },
];

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

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState(INITIAL_SUBSCRIBERS);
  const [selectedSubscriber, setSelectedSubscriber] =
    useState<Subscriber | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | SubscriberStatus
  >("all");

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
        statusFilter === "all" || subscriber.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subscribers, search, statusFilter]);

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

  const updateSubscriberStatus = (
    subscriberId: string,
    status: SubscriberStatus
  ) => {
    setSubscribers((current) =>
      current.map((subscriber) =>
        subscriber.id === subscriberId
          ? {
              ...subscriber,
              status,
            }
          : subscriber
      )
    );

    setSelectedSubscriber((current) =>
      current
        ? {
            ...current,
            status,
          }
        : null
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

            <div className="text-sm text-gray-500">
              {filteredSubscribers.length} application
              {filteredSubscribers.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Statistics */}
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

        {/* Filters */}
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
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={17} className="text-gray-500" />

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
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
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
                {filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* Applicant */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                          {subscriber.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
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
                        {getStatusLabel(subscriber.status)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSubscriber(subscriber)
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-500 hover:text-red-600"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredSubscribers.length === 0 && (
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
                          Try changing your search or filter.
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

      {/* Review Drawer Overlay */}
      {selectedSubscriber && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close review panel"
            onClick={() => setSelectedSubscriber(null)}
            className="absolute inset-0 bg-black/40"
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
            {/* Drawer Header */}
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
                onClick={() => setSelectedSubscriber(null)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-lg font-bold text-red-600">
                  {selectedSubscriber.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
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

              {/* Contact details */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={<Mail size={16} />}
                  label="Email"
                  value={selectedSubscriber.email}
                />

                <InfoItem
                  icon={<Phone size={16} />}
                  label="Phone"
                  value={selectedSubscriber.phone}
                />

                <InfoItem
                  icon={<Globe size={16} />}
                  label="Location"
                  value={selectedSubscriber.location}
                />

                <InfoItem
                  icon={<CalendarDays size={16} />}
                  label="Submitted"
                  value={selectedSubscriber.submittedAt}
                />

                <InfoItem
                  icon={<User size={16} />}
                  label="Current Status"
                  value={getStatusLabel(selectedSubscriber.status)}
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

              {/* Interests */}
              <div className="mt-7">
                <h4 className="text-sm font-semibold text-gray-900">
                  Interests
                </h4>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSubscriber.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reason */}
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

              {/* Website */}
              {selectedSubscriber.website && (
                <div className="mt-7">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Website
                  </h4>

                  <p className="mt-2 text-sm text-gray-600">
                    {selectedSubscriber.website}
                  </p>
                </div>
              )}

              {/* Status */}
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
                    {getStatusLabel(selectedSubscriber.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-gray-200 bg-white px-6 py-5">
              {selectedSubscriber.status === "pending" ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      updateSubscriberStatus(
                        selectedSubscriber.id,
                        "rejected"
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateSubscriberStatus(
                        selectedSubscriber.id,
                        "approved"
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <Check size={18} />
                    Approve
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedSubscriber(null)}
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
      <p className="text-sm font-medium text-gray-500">{title}</p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-3xl font-bold text-gray-900">{value}</p>

        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
          {description}
        </span>
      </div>
    </div>
  );
}

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