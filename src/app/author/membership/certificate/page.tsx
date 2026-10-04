"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getDocumentDownloadUrl,
  getMyDocument,
  type MemberDocument,
} from "@/lib/api/documents";

export default function MembershipCertificatePage() {
  const searchParams = useSearchParams();
  const documentNumber = searchParams.get("document");

  const [document, setDocument] = useState<MemberDocument | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDocument() {
      if (!documentNumber) {
        if (!cancelled) {
          setError("Document number is missing.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getMyDocument(documentNumber);

        if (data.document_type !== "certificate") {
          throw new Error("This document is not a membership certificate.");
        }

        if (!data.has_pdf) {
          throw new Error("The PDF for this document has not been generated yet.");
        }

        const url = await getDocumentDownloadUrl(documentNumber);

        if (!cancelled) {
          setDocument(data);
          setPdfUrl(url);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load the membership certificate."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDocument();

    return () => {
      cancelled = true;
    };
  }, [documentNumber]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-600">Loading membership certificate...</p>
        </div>
      </main>
    );
  }

  if (error || !document || !pdfUrl) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-xl font-semibold text-red-900">
            Unable to open membership certificate
          </h1>
          <p className="mt-3 text-sm text-red-700">
            {error ?? "Document could not be loaded."}
          </p>
          <Link
            href="/author/membership"
            className="mt-6 inline-block rounded-lg bg-slate-950 px-5 py-3 text-sm font-medium text-white"
          >
            Back to Membership
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/author/membership"
              className="text-sm text-slate-600 hover:text-slate-950"
            >
              ← Back to Membership
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">
              Membership Certificate
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {document.document_number}
            </p>
          </div>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Open PDF
          </a>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <iframe
            src={pdfUrl}
            title={`Membership Certificate ${document.document_number}`}
            className="h-[calc(100vh-170px)] min-h-[700px] w-full border-0"
          />
        </div>
      </div>
    </main>
  );
}
