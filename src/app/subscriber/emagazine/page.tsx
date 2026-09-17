"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Download,
  FileText,
  Loader2,
} from "lucide-react";

import { getEmagazines } from "@/lib/api/emagazines";
import type { Emagazine } from "@/types/emagazine";

export default function SubscriberEmagazinePage() {
  const [magazines, setMagazines] = useState<Emagazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMagazines() {
      try {
        setLoading(true);
        setError("");

        const data = await getEmagazines();

        setMagazines(
          data.filter((magazine) => magazine.status === "published")
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load e-Magazines."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMagazines();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            href="/subscriber/dashboard"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
              <BookOpen className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                E-Magazine
              </h1>

              <p className="text-sm text-slate-500">
                Your subscriber digital magazine library
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-slate-500" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        ) : magazines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300" />

            <h2 className="text-lg font-bold text-slate-800">
              No magazines available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Published e-Magazines will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {magazines.map((magazine) => (
              <article
                key={magazine.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                  {magazine.featured_image_url ? (
                    <img
                      src={magazine.featured_image_url}
                      alt={magazine.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FileText className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    {magazine.issue_number && (
                      <span className="text-xs font-bold text-slate-500">
                        {magazine.issue_number}
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-xs text-slate-500">
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

                  <h2 className="mt-3 text-lg font-bold text-slate-900">
                    {magazine.title}
                  </h2>

                  {magazine.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                      {magazine.description}
                    </p>
                  )}

                  <div className="mt-5 flex gap-2">
                    <Link
                      href={`/subscriber/emagazine/${magazine.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <BookOpen className="h-4 w-4" />
                      Read Magazine
                    </Link>

                    {magazine.pdf_url && (
                      <a
                        href={magazine.pdf_url}
                        download
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-700 hover:bg-slate-50"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}