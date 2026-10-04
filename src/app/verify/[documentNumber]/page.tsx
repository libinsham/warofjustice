"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type VerificationDocument = {
  document_number: string;
  document_type?: string;
  document_type_display?: string;
  status?: string;
  status_display?: string;
  issue_date?: string | null;
  expiry_date?: string | null;
  name?: string | null;
  designation?: string | null;
};

type VerificationResponse = {
  verified: boolean;
  document?: VerificationDocument;
  status?: string;
  detail?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api/v1";

export default function VerifyDocumentPage() {
  const params = useParams<{ documentNumber: string }>();
  const documentNumber = params.documentNumber;

  const [data, setData] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!documentNumber) {
        setError("Document number is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/documents/verify/${encodeURIComponent(
            documentNumber
          )}/`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.detail ||
              "Unable to verify this document."
          );
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to verify this document."
        );
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [documentNumber]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <div className="rounded-2xl bg-white px-8 py-10 text-center shadow-xl">
          <p className="text-sm text-slate-600">
            Verifying document...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl">
            ✕
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Document Verification Failed
          </h1>

          <p className="mt-3 text-slate-600">
            {error}
          </p>

          <p className="mt-4 text-sm text-slate-500">
            Document Number: {documentNumber}
          </p>
        </div>
      </main>
    );
  }

  const document = data?.document;

  const valid =
    data?.verified === true;

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <div
            className={`p-8 text-white ${
              valid ? "bg-emerald-600" : "bg-red-600"
            }`}
          >
            <p className="text-sm font-medium uppercase tracking-wider opacity-90">
              War of Justice
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              {valid ? "Document Verified" : "Document Not Valid"}
            </h1>

            <p className="mt-2 text-sm opacity-90">
              Official document verification
            </p>
          </div>

          <div className="space-y-5 p-8">
            <VerificationRow
              label="Document Number"
              value={
                document?.document_number ||
                documentNumber
              }
            />

            <VerificationRow
              label="Document Type"
              value={
                document?.document_type_display ||
                document?.document_type ||
                "—"
              }
            />

            <VerificationRow
              label="Status"
              value={
                document?.status_display ||
                document?.status ||
                (valid ? "Valid" : "Invalid")
              }
            />

            <VerificationRow
              label="Issue Date"
              value={
                document?.issue_date
                  ? formatDate(document.issue_date)
                  : "—"
              }
            />

            <VerificationRow
              label="Expiry Date"
              value={
                document?.expiry_date
                  ? formatDate(document.expiry_date)
                  : "No expiry"
              }
            />

            {document?.name && (
              <VerificationRow
                label="Name"
                value={document.name}
              />
            )}

            {document?.designation && (
              <VerificationRow
                label="Designation"
                value={document.designation}
              />
            )}

            <div className="border-t border-slate-200 pt-6">
              <p className="text-xs leading-5 text-slate-500">
                This verification page displays only public
                verification information. Private contact
                information is not exposed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function VerificationRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function formatDate(value: string) {
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