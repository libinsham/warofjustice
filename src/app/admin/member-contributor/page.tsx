"use client";

import { useEffect, useMemo, useState } from "react";
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
  Loader2,
  RefreshCw,
  AlertCircle,
  Eye,
  ExternalLink,
} from "lucide-react";

import {
  authApi,
  type MemberContributorApplication as ApiMemberContributorApplication,
} from "@/lib/api/auth";

type ApplicationStatus = "pending" | "approved" | "rejected";

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
  privacyAccepted: boolean;
  communicationConsent: boolean;
}


/* =========================================================
   HELPERS
========================================================= */

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

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


function capitalizeText(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


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


/* =========================================================
   BACKEND → ADMIN UI MAPPING
========================================================= */

function mapApplication(
  application: ApiMemberContributorApplication,
): MemberContributorApplication {
  return {
    id: String(application.id),

    applicationId:
      application.application_id || "—",

    name:
      application.full_name || "—",

    email:
      application.email || "—",

    phone:
      application.mobile_number || "—",

    dateOfBirth:
      application.date_of_birth || "—",

    gender:
      application.gender || "—",

    address: {
      house:
        application.house_or_street || "—",

      village:
        application.village_town_city || "—",

      taluk:
        application.taluk || "—",

      mandal:
        application.mandal || "—",

      district:
        application.district || "—",

      state:
        application.state || "—",

      pinCode:
        application.pin_code || "—",
    },

    residentialStatus:
      application.residential_status || "—",

    citizenship:
      application.citizenship || "—",

    educationalStatus:
      application.educational_status || "—",

    profession:
      application.profession || "—",

    belowPovertyLine:
      Boolean(application.below_poverty_line),

    reportingAreas:
      Array.isArray(
        application.preferred_reporting_areas,
      )
        ? application.preferred_reporting_areas
        : [],

    membershipCategory:
      application.membership_category || "—",

    status:
      application.status || "pending",

    submittedAt:
      formatDate(application.created_at),

    documents: {
      selfie: Boolean(
        application.selfie_photo,
      ),

      aadhaar: Boolean(
        application.aadhaar_card,
      ),

      pan: Boolean(
        application.pan_card,
      ),

      identityProof: Boolean(
        application.identity_proof,
      ),

      supportingDocuments: Boolean(
        application.supporting_documents,
      ),
    },

    declarationAccepted:
      Boolean(application.declaration_accepted),

    termsAccepted:
      Boolean(application.terms_accepted),

    privacyAccepted:
      Boolean(application.privacy_policy_accepted),

    communicationConsent:
      Boolean(application.communication_consent),
  };
}


/* =========================================================
   PAGE
========================================================= */

export default function MemberContributorPage() {
  const [applications, setApplications] =
    useState<MemberContributorApplication[]>([]);

  const [selectedApplication, setSelectedApplication] =
    useState<MemberContributorApplication | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | ApplicationStatus>("all");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [documentPreview, setDocumentPreview] =
    useState<{
      url: string;
      label: string;
      documentType:
        | "selfie"
        | "identity-proof"
        | "aadhaar"
        | "pan"
        | "supporting";
    } | null>(null);

  const [documentLoading, setDocumentLoading] =
    useState<string | null>(null);

  const [documentError, setDocumentError] =
    useState<string | null>(null);

  const [actionLoading, setActionLoading] =
    useState<"approve" | "reject" | null>(null);


  /* =======================================================
     LOAD REAL APPLICATIONS
  ======================================================= */

  const loadApplications = async (
    showRefreshLoader = false,
  ) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const data =
        await authApi.getMemberContributorApplications();

      const mapped =
        data.map(mapApplication);

      setApplications(mapped);

    } catch (err: unknown) {
      console.error(
        "Failed to load Member & Contributor applications:",
        err,
      );

      let message =
        "Unable to load applications.";

      if (
        err &&
        typeof err === "object" &&
        "response" in err
      ) {
        const response = (
          err as {
            response?: {
              data?: {
                detail?: string;
              };
            };
          }
        ).response;

        message =
          response?.data?.detail ||
          message;
      }

      setError(message);

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    void loadApplications();
  }, []);


  /* =======================================================
     FILTERING
  ======================================================= */

  const filteredApplications =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return applications.filter(
        (application) => {
          const matchesSearch =
            !query ||
            application.name
              .toLowerCase()
              .includes(query) ||
            application.email
              .toLowerCase()
              .includes(query) ||
            application.applicationId
              .toLowerCase()
              .includes(query) ||
            application.phone
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "all" ||
            application.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      applications,
      search,
      statusFilter,
    ]);


  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalApplications =
    applications.length;

  const pendingCount =
    applications.filter(
      (application) =>
        application.status ===
        "pending",
    ).length;

  const approvedCount =
    applications.filter(
      (application) =>
        application.status ===
        "approved",
    ).length;

  const rejectedCount =
    applications.filter(
      (application) =>
        application.status ===
        "rejected",
    ).length;


  /* =======================================================
     DOCUMENT VIEW
  ======================================================= */

  const viewDocument = async (
    applicationId: string,
    documentType:
      | "selfie"
      | "identity-proof"
      | "aadhaar"
      | "pan"
      | "supporting",
    label: string,
  ) => {
    try {
      setDocumentLoading(`${applicationId}-${documentType}`);
      setDocumentError(null);

      const response =
        await authApi.getMemberContributorDocument(
          Number(applicationId),
          documentType,
        );

      if (!response?.url) {
        throw new Error("Document URL was not returned by the server.");
      }

      setDocumentPreview({
        url: response.url,
        label,
        documentType,
      });
    } catch (err: unknown) {
      console.error("Failed to load document:", err);

      let message = "Unable to load this document.";

      if (
        err &&
        typeof err === "object" &&
        "response" in err
      ) {
        const response = (
          err as {
            response?: {
              status?: number;
              data?: {
                detail?: string;
              };
            };
          }
        ).response;

        if (response?.status === 401) {
          message = "Your session has expired. Please log in again.";
        } else {
          message =
            response?.data?.detail || message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setDocumentError(message);
    } finally {
      setDocumentLoading(null);
    }
  };


  /* =======================================================
     DATABASE APPROVAL / REJECTION
  ======================================================= */

  const approveApplication = async (
    applicationId: string,
  ) => {
    try {
      setActionLoading("approve");
      setError(null);

      /*
       * Member and Contributor use one shared publishing access.
       * The backend activates the existing author/publishing role.
       */
      const response =
        await authApi.approveMemberContributorApplication(
          Number(applicationId),
        );

      if (!response?.application) {
        throw new Error(
          "Approval succeeded but no application was returned.",
        );
      }

      const updatedApplication = mapApplication(
        response.application as ApiMemberContributorApplication,
      );

      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? updatedApplication
            : application,
        ),
      );

      setSelectedApplication(updatedApplication);

      // Re-fetch from the database so the screen reflects the permanent state.
      await loadApplications();
    } catch (err: unknown) {
      console.error("Failed to approve application:", err);

      let message = "Unable to approve this application.";

      if (
        err &&
        typeof err === "object" &&
        "response" in err
      ) {
        const response = (
          err as {
            response?: {
              data?: {
                detail?: string;
                error?: string;
              };
            };
          }
        ).response;

        message =
          response?.data?.detail ||
          response?.data?.error ||
          message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const rejectApplication = async (applicationId: string) => {
    const reason = window.prompt(
      "Please enter the reason for rejecting this application:",
      "",
    );

    if (reason === null) {
      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError("A rejection reason is required.");
      return;
    }

    try {
      setActionLoading("reject");
      setError(null);

      const response =
        await authApi.rejectMemberContributorApplication(
          Number(applicationId),
          trimmedReason,
        );

      if (!response?.application) {
        throw new Error("Rejection succeeded but no application was returned.");
      }

      const updatedApplication = mapApplication(
        response.application as ApiMemberContributorApplication,
      );

      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? updatedApplication
            : application,
        ),
      );

      setSelectedApplication(updatedApplication);

      // Re-fetch from the database so the screen reflects the permanent state.
      await loadApplications();
    } catch (err: unknown) {
      console.error("Failed to reject application:", err);

      let message = "Unable to reject this application.";

      if (
        err &&
        typeof err === "object" &&
        "response" in err
      ) {
        const response = (
          err as {
            response?: {
              data?: {
                detail?: string;
                error?: string;
              };
            };
          }
        ).response;

        message =
          response?.data?.detail ||
          response?.data?.error ||
          message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
    } finally {
      setActionLoading(null);
    }
  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===================================================
          HEADER
      =================================================== */}

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
                    Review Member & Contributor applications and publishing access.
                  </p>

                </div>

              </div>
            </div>


            <div className="flex items-center gap-4">

              <button
                type="button"
                onClick={() =>
                  void loadApplications(true)
                }
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <RefreshCw size={16} />
                )}

                Refresh
              </button>

              <div className="text-sm text-gray-500">
                {filteredApplications.length} application
                {filteredApplications.length !== 1
                  ? "s"
                  : ""}
              </div>

            </div>

          </div>

        </div>
      </div>


      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="p-6">

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">

              <p className="font-semibold">
                Failed to load applications
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                void loadApplications()
              }
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm ring-1 ring-red-200 hover:bg-red-50"
            >
              Try Again
            </button>

          </div>
        )}


        {/* =================================================
            STATISTICS
        ================================================= */}

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
            title="Approved"
            value={approvedCount}
            description="Member & Contributor"
          />

          <StatCard
            title="Rejected"
            value={rejectedCount}
            description="Rejected applications"
          />

        </div>


        {/* =================================================
            FILTERS
        ================================================= */}

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
                      | ApplicationStatus,
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



            </div>

          </div>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-16 shadow-sm">

            <div className="flex flex-col items-center justify-center">

              <Loader2
                size={32}
                className="animate-spin text-red-600"
              />

              <p className="mt-4 text-sm font-semibold text-gray-800">
                Loading applications...
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Fetching the latest records from the server.
              </p>

            </div>

          </div>
        ) : (
          <>

            {/* =============================================
                TABLE
            ============================================= */}

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
                        Access
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
                                    (part) =>
                                      part[0],
                                  )
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
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
                              {capitalizeText(
                                application.membershipCategory,
                              )}
                            </span>

                          </td>


                          <td className="px-5 py-4">

                            {application.status === "approved" ? (
                              <span className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                                Member & Contributor
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
                                application.status,
                              )}`}
                            >
                              {getStatusLabel(
                                application.status,
                              )}
                            </span>

                          </td>


                          <td className="px-5 py-4 text-right">

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedApplication(
                                  application,
                                );
                              }}
                              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-red-500 hover:text-red-600"
                            >
                              Review
                            </button>

                          </td>

                        </tr>
                      ),
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
                            Try changing your search or filters.
                          </p>

                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </>
        )}

      </div>


      {/* ===================================================
          REVIEW DRAWER
      =================================================== */}

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

            {/* =================================================
                DRAWER HEADER
            ================================================= */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                  Application Review
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {selectedApplication.name}
                </h2>

                <p className="mt-1 font-mono text-xs text-gray-500">
                  {selectedApplication.applicationId}
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


            {/* =================================================
                DRAWER BODY
            ================================================= */}

            <div className="flex-1 overflow-y-auto px-6 py-6">

              {/* PERSONAL INFORMATION */}

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
                    icon={
                      <CalendarDays size={16} />
                    }
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


              {/* ADDRESS */}

              <Section title="Residential Address">

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                  <div className="flex gap-2">

                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <p className="text-sm leading-6 text-gray-700">

                      {selectedApplication.address.house}

                      {selectedApplication.address.house !==
                        "—" && ", "}

                      {selectedApplication.address.village}

                      {selectedApplication.address.village !==
                        "—" && ", "}

                      {selectedApplication.address.taluk}

                      {selectedApplication.address.taluk !==
                        "—" && ", "}

                      {selectedApplication.address.district}

                      {selectedApplication.address.district !==
                        "—" && ", "}

                      {selectedApplication.address.state}

                      {selectedApplication.address.state !==
                        "—" && " - "}

                      {selectedApplication.address.pinCode}

                    </p>

                  </div>

                </div>

              </Section>


              {/* APPLICANT DETAILS */}

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
                      capitalizeText(
                        selectedApplication.membershipCategory,
                      )
                    }
                  />

                </InfoGrid>

              </Section>


              {/* REPORTING AREAS */}

              <Section title="Preferred Reporting Areas">

                {selectedApplication.reportingAreas.length >
                0 ? (

                  <div className="flex flex-wrap gap-2">

                    {selectedApplication.reportingAreas.map(
                      (area) => (

                        <span
                          key={area}
                          className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700"
                        >
                          {capitalizeText(area)}
                        </span>

                      ),
                    )}

                  </div>

                ) : (

                  <p className="text-sm text-gray-500">
                    No reporting areas selected.
                  </p>

                )}

              </Section>


              {/* DOCUMENTS */}

              <Section title="Documents">

                <div className="grid gap-3 sm:grid-cols-2">

                  <DocumentItem
                    label="Selfie Photograph"
                    uploaded={
                      selectedApplication.documents.selfie
                    }
                    applicationId={selectedApplication.id}
                    documentType="selfie"
                    loadingKey={documentLoading}
                    onView={viewDocument}
                  />

                  <DocumentItem
                    label="Aadhaar Card"
                    uploaded={
                      selectedApplication.documents.aadhaar
                    }
                    applicationId={selectedApplication.id}
                    documentType="aadhaar"
                    loadingKey={documentLoading}
                    onView={viewDocument}
                  />

                  <DocumentItem
                    label="PAN Card"
                    uploaded={
                      selectedApplication.documents.pan
                    }
                    applicationId={selectedApplication.id}
                    documentType="pan"
                    loadingKey={documentLoading}
                    onView={viewDocument}
                  />

                  <DocumentItem
                    label="Identity Proof"
                    uploaded={
                      selectedApplication.documents.identityProof
                    }
                    applicationId={selectedApplication.id}
                    documentType="identity-proof"
                    loadingKey={documentLoading}
                    onView={viewDocument}
                  />

                  <DocumentItem
                    label="Supporting Documents"
                    uploaded={
                      selectedApplication.documents
                        .supportingDocuments
                    }
                    applicationId={selectedApplication.id}
                    documentType="supporting"
                    loadingKey={documentLoading}
                    onView={viewDocument}
                  />

                </div>

                {documentError && (
                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {documentError}
                  </div>
                )}

              </Section>


              {/* DECLARATIONS */}

              <Section title="Declarations">

                <div className="space-y-2 text-sm">

                  <DeclarationRow
                    label="Declaration & Oath"
                    accepted={
                      selectedApplication.declarationAccepted
                    }
                  />

                  <DeclarationRow
                    label="Terms & Conditions"
                    accepted={
                      selectedApplication.termsAccepted
                    }
                  />

                  <DeclarationRow
                    label="Privacy Policy"
                    accepted={
                      selectedApplication.privacyAccepted
                    }
                  />

                  <DeclarationRow
                    label="Communication Consent"
                    accepted={
                      selectedApplication.communicationConsent
                    }
                  />

                </div>

              </Section>


              {/* MEMBER & CONTRIBUTOR ACCESS */}

              {selectedApplication.status ===
                "pending" && (

                <Section title="Access">

                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">

                    <p className="text-sm font-semibold text-gray-900">
                      Member & Contributor
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-600">
                      Approved applicants receive the same publishing access.
                      They can write articles and submit posts for Super Admin approval.
                    </p>

                  </div>

                </Section>
              )}


              {/* APPROVED ACCESS */}

              {selectedApplication.status ===
                "approved" && (

                <Section title="Access">

                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">

                    <p className="text-sm font-semibold text-green-700">
                      Member & Contributor
                    </p>

                    <p className="mt-1 text-xs text-green-700/80">
                      Publishing access is active.
                    </p>

                  </div>

                </Section>
              )}

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="border-t border-gray-200 bg-white px-6 py-5">

              {selectedApplication.status ===
              "pending" ? (

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      void rejectApplication(
                        selectedApplication.id,
                      )
                    }
                    disabled={Boolean(actionLoading)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading === "reject" ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <XCircle size={18} />
                    )}
                    {actionLoading === "reject" ? "Rejecting..." : "Reject"}
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      void approveApplication(
                        selectedApplication.id,
                      )
                    }
                    disabled={Boolean(actionLoading)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {actionLoading === "approve" ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Check size={18} />
                    )}

                    {actionLoading === "approve"
                      ? "Approving..."
                      : "Approve Member & Contributor"}

                  </button>

                </div>

              ) : (

                <button
                  type="button"
                  onClick={() =>
                    setSelectedApplication(
                      null,
                    )
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

      {documentPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <button
            type="button"
            aria-label="Close document preview"
            onClick={() => setDocumentPreview(null)}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                  Document Preview
                </p>
                <h3 className="mt-1 text-base font-bold text-gray-900">
                  {documentPreview.label}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={documentPreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-red-500 hover:text-red-600"
                >
                  <ExternalLink size={16} />
                  Open in New Tab
                </a>

                <button
                  type="button"
                  onClick={() => setDocumentPreview(null)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Close document preview"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 bg-gray-100 p-3">
              <iframe
                src={documentPreview.url}
                title={documentPreview.label}
                className="h-full w-full rounded-xl border border-gray-200 bg-white"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

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


/* =========================================================
   SECTION
========================================================= */

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


/* =========================================================
   INFO GRID
========================================================= */

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


/* =========================================================
   INFO ITEM
========================================================= */

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
        {value || "—"}
      </p>

    </div>
  );
}


/* =========================================================
   DOCUMENT ITEM
========================================================= */

function DocumentItem({
  label,
  uploaded,
  applicationId,
  documentType,
  loadingKey,
  onView,
}: {
  label: string;
  uploaded: boolean;
  applicationId: string;
  documentType:
    | "selfie"
    | "identity-proof"
    | "aadhaar"
    | "pan"
    | "supporting";
  loadingKey: string | null;
  onView: (
    applicationId: string,
    documentType:
      | "selfie"
      | "identity-proof"
      | "aadhaar"
      | "pan"
      | "supporting",
    label: string,
  ) => void;
}) {
  const currentLoadingKey = `${applicationId}-${documentType}`;
  const isLoading = loadingKey === currentLoadingKey;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
          <FileText
            size={17}
            className="text-gray-500"
          />
        </div>

        <span className="truncate text-sm font-medium text-gray-800">
          {label}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`text-xs font-semibold ${
            uploaded
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {uploaded
            ? "Uploaded"
            : "Missing"}
        </span>

        {uploaded && (
          <button
            type="button"
            onClick={() =>
              onView(
                applicationId,
                documentType,
                label,
              )
            }
            disabled={Boolean(loadingKey)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Eye size={14} />
            )}
            {isLoading ? "Loading..." : "View"}
          </button>
        )}
      </div>
    </div>
  );
}


/* =========================================================
   DECLARATION ROW
========================================================= */

function DeclarationRow({
  label,
  accepted,
}: {
  label: string;
  accepted: boolean;
}) {
  return (
    <p className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-gray-600">

      <span>
        {label}
      </span>

      <span
        className={
          accepted
            ? "font-semibold text-green-600"
            : "font-semibold text-red-600"
        }
      >
        {accepted
          ? "Accepted"
          : "Not Accepted"}
      </span>

    </p>
  );
}