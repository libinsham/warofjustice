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
  MapPin,
  FileText,
  ShieldCheck,
} from "lucide-react";

type ApplicationStatus = "pending" | "approved" | "rejected";

type ApprovedRole = "member" | "contributor" | null;

interface MemberContributorApplication {
  id: string;
  applicationId: string;

  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;

  gender: string;

  address: {
    house: string;
    village: string;
    taluk: string;
    mandal: string;
    district: string;
    state: string;
    pinCode: string;
  };

  residentialStatus: string;
  citizenship: string;
  educationalStatus: string;
  profession: string;

  belowPovertyLine: boolean;

  reportingAreas: string[];

  membershipCategory: string;

  status: ApplicationStatus;
  approvedRole: ApprovedRole;

  submittedAt: string;

  documents: {
    selfie: boolean;
    aadhaar: boolean;
    pan: boolean;
    identityProof: boolean;
    supportingDocuments: boolean;
  };

  declarationAccepted: boolean;
  termsAccepted: boolean;
}

const INITIAL_APPLICATIONS: MemberContributorApplication[] = [
  {
    id: "1",
    applicationId: "WOJ-MC-2026-1001",

    name: "Arun Kumar",
    email: "arun@example.com",
    phone: "+91 98765 43210",
    dateOfBirth: "14 August 1994",

    gender: "Male",

    address: {
      house: "24, Gandhi Street",
      village: "Poonamallee",
      taluk: "Poonamallee",
      mandal: "Poonamallee",
      district: "Tiruvallur",
      state: "Tamil Nadu",
      pinCode: "600056",
    },

    residentialStatus: "Resident",
    citizenship: "Indian",
    educationalStatus: "Graduate",
    profession: "Journalist",

    belowPovertyLine: false,

    reportingAreas: [
      "Politics",
      "Education",
      "Human Rights",
    ],

    membershipCategory: "Member",

    status: "pending",
    approvedRole: null,

    submittedAt: "14 Sep 2026",

    documents: {
      selfie: true,
      aadhaar: true,
      pan: true,
      identityProof: true,
      supportingDocuments: true,
    },

    declarationAccepted: true,
    termsAccepted: true,
  },

  {
    id: "2",
    applicationId: "WOJ-MC-2026-0998",

    name: "Priya Nair",
    email: "priya@example.com",
    phone: "+91 91234 56789",
    dateOfBirth: "22 February 1991",

    gender: "Female",

    address: {
      house: "14 MG Road",
      village: "Ernakulam",
      taluk: "Kanayannur",
      mandal: "Ernakulam",
      district: "Ernakulam",
      state: "Kerala",
      pinCode: "682011",
    },

    residentialStatus: "Resident",
    citizenship: "Indian",
    educationalStatus: "Post Graduate",
    profession: "Content Writer",

    belowPovertyLine: false,

    reportingAreas: [
      "Technology",
      "Business",
      "Education",
    ],

    membershipCategory: "Contributor",

    status: "approved",
    approvedRole: "contributor",

    submittedAt: "13 Sep 2026",

    documents: {
      selfie: true,
      aadhaar: true,
      pan: true,
      identityProof: true,
      supportingDocuments: true,
    },

    declarationAccepted: true,
    termsAccepted: true,
  },

  {
    id: "3",
    applicationId: "WOJ-MC-2026-0992",

    name: "Rahul Das",
    email: "rahul@example.com",
    phone: "+91 99887 66554",
    dateOfBirth: "08 November 1996",

    gender: "Male",

    address: {
      house: "18 Park Street",
      village: "Adyar",
      taluk: "Mylapore",
      mandal: "Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
      pinCode: "600020",
    },

    residentialStatus: "Resident",
    citizenship: "Indian",
    educationalStatus: "Graduate",
    profession: "Student",

    belowPovertyLine: false,

    reportingAreas: ["Sports", "Entertainment"],

    membershipCategory: "Volunteer",

    status: "rejected",
    approvedRole: null,

    submittedAt: "12 Sep 2026",

    documents: {
      selfie: true,
      aadhaar: true,
      pan: false,
      identityProof: true,
      supportingDocuments: false,
    },

    declarationAccepted: true,
    termsAccepted: true,
  },
];

function getStatusClasses(status: ApplicationStatus) {
  switch (status) {
    case "approved":
      return "border-green-200 bg-green-50 text-green-700";

    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function getStatusLabel(status: ApplicationStatus) {
  switch (status) {
    case "approved":
      return "Approved";

    case "rejected":
      return "Rejected";

    default:
      return "Pending";
  }
}

export default function MemberContributorPage() {
  const [applications, setApplications] = useState(
    INITIAL_APPLICATIONS
  );

  const [selectedApplication, setSelectedApplication] =
    useState<MemberContributorApplication | null>(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "all" | ApplicationStatus
  >("all");

  const [roleFilter, setRoleFilter] = useState<
    "all" | "member" | "contributor"
  >("all");

  const [approvalRole, setApprovalRole] = useState<
    "member" | "contributor"
  >("member");

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        !query ||
        application.name.toLowerCase().includes(query) ||
        application.email.toLowerCase().includes(query) ||
        application.applicationId
          .toLowerCase()
          .includes(query) ||
        application.phone.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        application.status === statusFilter;

      const matchesRole =
        roleFilter === "all" ||
        application.approvedRole === roleFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole
      );
    });
  }, [
    applications,
    search,
    statusFilter,
    roleFilter,
  ]);

  const totalApplications = applications.length;

  const pendingCount = applications.filter(
    (application) => application.status === "pending"
  ).length;

  const memberCount = applications.filter(
    (application) =>
      application.status === "approved" &&
      application.approvedRole === "member"
  ).length;

  const contributorCount = applications.filter(
    (application) =>
      application.status === "approved" &&
      application.approvedRole === "contributor"
  ).length;

  const approveApplication = (
    applicationId: string,
    role: "member" | "contributor"
  ) => {
    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId
          ? {
              ...application,
              status: "approved",
              approvedRole: role,
            }
          : application
      )
    );

    setSelectedApplication((current) =>
      current
        ? {
            ...current,
            status: "approved",
            approvedRole: role,
          }
        : null
    );
  };

  const rejectApplication = (applicationId: string) => {
    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId
          ? {
              ...application,
              status: "rejected",
              approvedRole: null,
            }
          : application
      )
    );

    setSelectedApplication((current) =>
      current
        ? {
            ...current,
            status: "rejected",
            approvedRole: null,
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
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Member & Contributor
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">
                    Review membership and contributor applications.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              {filteredApplications.length} application
              {filteredApplications.length !== 1
                ? "s"
                : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Applications"
            value={totalApplications}
            description="All applications"
          />

          <StatCard
            title="Pending Review"
            value={pendingCount}
            description="Awaiting review"
          />

          <StatCard
            title="Members"
            value={memberCount}
            description="Approved members"
          />

          <StatCard
            title="Contributors"
            value={contributorCount}
            description="Approved contributors"
          />
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search name, email, phone or application ID..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
                      | ApplicationStatus
                  )
                }
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-500"
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

              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(
                    event.target.value as
                      | "all"
                      | "member"
                      | "contributor"
                  )
                }
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-500"
              >
                <option value="all">
                  All Roles
                </option>

                <option value="member">
                  Members
                </option>

                <option value="contributor">
                  Contributors
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Applicant
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Application ID
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Approved Role
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
                {filteredApplications.map(
                  (application) => (
                    <tr
                      key={application.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                            {application.name
                              .split(" ")
                              .map(
                                (part) => part[0]
                              )
                              .slice(0, 2)
                              .join("")}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {application.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              {application.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-mono text-sm text-gray-700">
                          {application.applicationId}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
                          {application.membershipCategory}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {application.approvedRole ? (
                          <span className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold capitalize text-red-700">
                            {application.approvedRole}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {application.submittedAt}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            application.status
                          )}`}
                        >
                          {getStatusLabel(
                            application.status
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedApplication(
                              application
                            );

                            setApprovalRole(
                              application.approvedRole ===
                                "contributor"
                                ? "contributor"
                                : "member"
                            );
                          }}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-red-500 hover:text-red-600"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  )
                )}

                {filteredApplications.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center"
                    >
                      <Search
                        size={20}
                        className="mx-auto text-gray-400"
                      />

                      <p className="mt-3 text-sm font-semibold text-gray-900">
                        No applications found
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Try changing your search or
                        filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Drawer */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close review"
            onClick={() =>
              setSelectedApplication(null)
            }
            className="absolute inset-0 bg-black/40"
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                  Application Review
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {selectedApplication.name}
                </h2>

                <p className="mt-1 font-mono text-xs text-gray-500">
                  {
                    selectedApplication.applicationId
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedApplication(null)
                }
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Contact */}
              <Section title="Personal Information">
                <InfoGrid>
                  <InfoItem
                    icon={<User size={16} />}
                    label="Full Name"
                    value={
                      selectedApplication.name
                    }
                  />

                  <InfoItem
                    icon={<CalendarDays size={16} />}
                    label="Date of Birth"
                    value={
                      selectedApplication.dateOfBirth
                    }
                  />

                  <InfoItem
                    icon={<User size={16} />}
                    label="Gender"
                    value={
                      selectedApplication.gender
                    }
                  />

                  <InfoItem
                    icon={<Mail size={16} />}
                    label="Email"
                    value={
                      selectedApplication.email
                    }
                  />

                  <InfoItem
                    icon={<Phone size={16} />}
                    label="Mobile"
                    value={
                      selectedApplication.phone
                    }
                  />

                  <InfoItem
                    icon={<FileText size={16} />}
                    label="Profession"
                    value={
                      selectedApplication.profession
                    }
                  />
                </InfoGrid>
              </Section>

              {/* Address */}
              <Section title="Residential Address">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex gap-2">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <p className="text-sm leading-6 text-gray-700">
                      {
                        selectedApplication.address
                          .house
                      }
                      ,{" "}
                      {
                        selectedApplication.address
                          .village
                      }
                      ,{" "}
                      {
                        selectedApplication.address
                          .taluk
                      }
                      ,{" "}
                      {
                        selectedApplication.address
                          .district
                      }
                      ,{" "}
                      {
                        selectedApplication.address
                          .state
                      }{" "}
                      -{" "}
                      {
                        selectedApplication.address
                          .pinCode
                      }
                    </p>
                  </div>
                </div>
              </Section>

              {/* Applicant details */}
              <Section title="Applicant Details">
                <InfoGrid>
                  <InfoItem
                    label="Residential Status"
                    value={
                      selectedApplication.residentialStatus
                    }
                  />

                  <InfoItem
                    label="Citizenship"
                    value={
                      selectedApplication.citizenship
                    }
                  />

                  <InfoItem
                    label="Education"
                    value={
                      selectedApplication.educationalStatus
                    }
                  />

                  <InfoItem
                    label="Profession"
                    value={
                      selectedApplication.profession
                    }
                  />

                  <InfoItem
                    label="Below Poverty Line"
                    value={
                      selectedApplication.belowPovertyLine
                        ? "Yes"
                        : "No"
                    }
                  />

                  <InfoItem
                    label="Membership Category"
                    value={
                      selectedApplication.membershipCategory
                    }
                  />
                </InfoGrid>
              </Section>

              {/* Reporting Areas */}
              <Section title="Preferred Reporting Areas">
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.reportingAreas.map(
                    (area) => (
                      <span
                        key={area}
                        className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700"
                      >
                        {area}
                      </span>
                    )
                  )}
                </div>
              </Section>

              {/* Documents */}
              <Section title="Documents">
                <div className="grid gap-3 sm:grid-cols-2">
                  <DocumentItem
                    label="Selfie Photograph"
                    uploaded={
                      selectedApplication.documents
                        .selfie
                    }
                  />

                  <DocumentItem
                    label="Aadhaar Card"
                    uploaded={
                      selectedApplication.documents
                        .aadhaar
                    }
                  />

                  <DocumentItem
                    label="PAN Card"
                    uploaded={
                      selectedApplication.documents.pan
                    }
                  />

                  <DocumentItem
                    label="Identity Proof"
                    uploaded={
                      selectedApplication.documents
                        .identityProof
                    }
                  />

                  <DocumentItem
                    label="Supporting Documents"
                    uploaded={
                      selectedApplication.documents
                        .supportingDocuments
                    }
                  />
                </div>
              </Section>

              {/* Declaration */}
              <Section title="Declarations">
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    Declaration & Oath:{" "}
                    <span className="font-semibold text-green-600">
                      Accepted
                    </span>
                  </p>

                  <p className="text-gray-600">
                    Terms & Conditions:{" "}
                    <span className="font-semibold text-green-600">
                      Accepted
                    </span>
                  </p>
                </div>
              </Section>

              {/* Approval */}
              {selectedApplication.status ===
                "pending" && (
                <Section title="Approval Role">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setApprovalRole("member")
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        approvalRole === "member"
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        Member
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Standard War of Justice member
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setApprovalRole(
                          "contributor"
                        )
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        approvalRole === "contributor"
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        Contributor
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Contributor with publishing/reporting
                        access
                      </p>
                    </button>
                  </div>
                </Section>
              )}

              {/* Existing role */}
              {selectedApplication.status ===
                "approved" &&
                selectedApplication.approvedRole && (
                  <Section title="Approved Role">
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                      <p className="text-sm font-semibold capitalize text-green-700">
                        {
                          selectedApplication.approvedRole
                        }
                      </p>
                    </div>
                  </Section>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-white px-6 py-5">
              {selectedApplication.status ===
              "pending" ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      rejectApplication(
                        selectedApplication.id
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      approveApplication(
                        selectedApplication.id,
                        approvalRole
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    <Check size={18} />
                    Approve as{" "}
                    <span className="capitalize">
                      {approvalRole}
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedApplication(null)
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        {title}
      </h3>

      {children}
    </section>
  );
}

function InfoGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {children}
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
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

function DocumentItem({
  label,
  uploaded,
}: {
  label: string;
  uploaded: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
          <FileText size={17} className="text-gray-500" />
        </div>

        <span className="text-sm font-medium text-gray-800">
          {label}
        </span>
      </div>

      <span
        className={`text-xs font-semibold ${
          uploaded
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        {uploaded ? "Uploaded" : "Missing"}
      </span>
    </div>
  );
}