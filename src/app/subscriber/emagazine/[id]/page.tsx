"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Download,
  Loader2,
} from "lucide-react";

import { getEmagazine } from "@/lib/api/emagazines";
import type { Emagazine } from "@/types/emagazine";

export default function ReadEmagazinePage() {
  const params = useParams();

  const magazineId = Number(params.id);

  const [magazine, setMagazine] = useState<Emagazine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isFinite(magazineId)) {
      setError("Invalid magazine ID.");
      setLoading(false);
      return;
    }

    async function loadMagazine() {
      try {
        setLoading(true);
        setError("");

        const data = await getEmagazine(magazineId);

        setMagazine(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load magazine."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMagazine();
  }, [magazineId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !magazine) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-slate-300" />

          <h1 className="text-lg font-bold text-slate-900">
            Magazine unavailable
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error || "The requested magazine could not be loaded."}
          </p>

          <Link
            href="/subscriber/emagazine"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to E-Magazines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="min-w-0">
            <Link
              href="/subscriber/emagazine"
              className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              E-Magazines
            </Link>

            <h1 className="truncate text-xl font-bold text-slate-900">
              {magazine.title}
            </h1>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {magazine.issue_number && (
                <span>{magazine.issue_number}</span>
              )}

              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />

                {new Date(
                  magazine.publication_date
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {magazine.pdf_url && (
            <a
              href={magazine.pdf_url}
              download
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          )}
        </div>
      </header>

      {/* Reader */}
      <main className="mx-auto max-w-7xl px-2 py-4 sm:px-6 lg:px-8">
        {magazine.pdf_url ? (
          <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
            <iframe
              src={magazine.pdf_url}
              title={magazine.title}
              className="h-[calc(100vh-150px)] min-h-[650px] w-full"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300" />

            <p className="font-semibold text-slate-700">
              PDF is not available.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}