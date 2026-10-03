"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getMyDocuments,
  type MemberDocument,
} from "@/lib/api/documents";

export default function MembershipPage() {
  const [documents, setDocuments] = useState<MemberDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      try {
        setLoading(true);
        setError(null);

        const data = await getMyDocuments();

        if (!cancelled) {
          setDocuments(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load membership documents."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDocuments();

    return () => {
      cancelled = true;
    };
  }, []);

  const idCard = documents.find(
    (document) => document.document_type === "id_card"
  );

  const certificate = documents.find(
    (document) => document.document_type === "certificate"
  );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/author/dashboard"
              className="transition hover:text-slate-900"
            >
              Dashboard
            </Link>

            <span>/</span>

            <span className="text-slate-700">Membership</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Membership
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            View your official War of Justice membership documents,
            verification details, and downloadable copies.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2">
            <DocumentSkeleton />
            <DocumentSkeleton />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-base font-semibold text-red-900">
              Unable to load membership documents
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && documents.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-7 w-7 text-slate-500"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                />
                <path d="M7 9h10M7 13h6" />
              </svg>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-950">
              No membership documents yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Your official membership documents will appear here after your
              membership has been approved and issued.
            </p>
          </div>
        )}

        {/* Documents */}
        {!loading && !error && documents.length > 0 && (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <MembershipDocumentCard
                title="Membership ID Card"
                description="Your official War of Justice membership identification card."
                document={idCard}
                href={
                  idCard
                    ? `/author/membership/id-card?document=${encodeURIComponent(
                        idCard.document_number
                      )}`
                    : undefined
                }
                icon={<IdCardIcon />}
              />

              <MembershipDocumentCard
                title="Membership Certificate"
                description="Your official War of Justice membership certificate."
                document={certificate}
                href={
                  certificate
                    ? `/author/membership/certificate?document=${encodeURIComponent(
                        certificate.document_number
                      )}`
                    : undefined
                }
                icon={<CertificateIcon />}
              />
            </div>

            {/* Verification Information */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-slate-950">
                Document Verification
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Every official document has a unique verification number and
                QR verification link. Public verification does not expose
                private contact information.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function MembershipDocumentCard({
  title,
  description,
  document,
  href,
  icon,
}: {
  title: string;
  description: string;
  document?: MemberDocument;
  href?: string;
  icon: React.ReactNode;
}) {
  const valid =
    document?.status === "issued" ||
    document?.status_display?.toLowerCase() === "issued";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Card Header */}
      <div className="border-b border-slate-100 bg-slate-950 px-6 py-5 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
            {icon}
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              {title}
            </h2>

            <p className="mt-1 text-xs text-slate-300">
              Official membership document
            </p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <p className="text-sm leading-6 text-slate-600">
          {description}
        </p>

        {document ? (
          <>
            <div className="mt-6 space-y-4">
              <InfoRow
                label="Document Number"
                value={document.document_number}
              />

              <InfoRow
                label="Issue Date"
                value={formatDate(document.issue_date)}
              />

              <InfoRow
                label="Expiry Date"
                value={
                  document.expiry_date
                    ? formatDate(document.expiry_date)
                    : "No expiry"
                }
              />

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm text-slate-500">
                  Status
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    valid
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {document.status_display || document.status}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              {href && (
                <Link
                  href={href}
                  className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  View Document
                </Link>
              )}

              {document.verification_url && (
                <a
                  href={document.verification_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Verify
                </a>
              )}
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              This document has not been issued yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function DocumentSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-24 animate-pulse bg-slate-200" />

      <div className="space-y-5 p-6">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-32 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

function IdCardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6 text-white"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <circle
        cx="8"
        cy="11"
        r="2"
      />
      <path d="M13 10h5M13 14h4" />
    </svg>
  );
}

function CertificateIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6 text-white"
    >
      <path d="M6 3h12v18l-6-3-6 3V3Z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}