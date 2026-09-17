"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Download,
  FileText,
  Loader2,
  ArrowRight,
} from "lucide-react";

import { getEmagazines } from "@/lib/api/emagazines";
import type { Emagazine } from "@/types/emagazine";

export default function EmagazineSection() {
  const [magazines, setMagazines] = useState<Emagazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
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

    load();
  }, []);

  return (
    <section
      id="emagazines"
      className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <BookOpen className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                E-Magazine
              </h2>

              <p className="text-sm text-slate-500">
                Read the latest War of Justice digital magazines.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/subscriber/emagazine"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="flex min-h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : magazines.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-400" />

          <p className="font-semibold text-slate-700">
            No e-Magazines published yet
          </p>

          <p className="mt-1 text-sm text-slate-500">
            New issues will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {magazines.slice(0, 3).map((magazine) => (
            <article
              key={magazine.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
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
                    <BookOpen className="h-10 w-10 text-slate-300" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  {magazine.issue_number && (
                    <span className="text-xs font-semibold text-slate-500">
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

                <h3 className="mt-2 line-clamp-2 text-base font-bold text-slate-900">
                  {magazine.title}
                </h3>

                {magazine.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">
                    {magazine.description}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/subscriber/emagazine/${magazine.id}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    <BookOpen className="h-4 w-4" />
                    Read
                  </Link>

                  {magazine.pdf_url && (
                    <a
                      href={magazine.pdf_url}
                      download
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-700 hover:bg-slate-50"
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
    </section>
  );
}