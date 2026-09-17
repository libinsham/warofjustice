"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";

import {
  createEmagazine,
  deleteEmagazine,
  getEmagazines,
  updateEmagazineStatus,
} from "@/lib/api/emagazines";

import type { Emagazine } from "@/types/emagazine";

const INITIAL_FORM = {
  title: "",
  issue_number: "",
  publication_date: "",
  description: "",
  status: "draft" as "draft" | "published",
};

export default function AdminEmagazinePage() {
  const [magazines, setMagazines] = useState<Emagazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM);

  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadMagazines() {
    try {
      setLoading(true);
      setError("");

      const data = await getEmagazines();
      setMagazines(data);
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

  useEffect(() => {
    loadMagazines();
  }, []);

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setFeaturedImage(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    setError("");
    setFeaturedImage(file);
  }

  function handlePdfChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setPdfFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      e.target.value = "";
      return;
    }

    setError("");
    setPdfFile(file);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Magazine title is required.");
      return;
    }

    if (!form.publication_date) {
      setError("Publication date is required.");
      return;
    }

    if (!featuredImage) {
      setError("Featured image / cover image is required.");
      return;
    }

    if (!pdfFile) {
      setError("PDF file is required.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", form.title.trim());
      formData.append("issue_number", form.issue_number.trim());
      formData.append("publication_date", form.publication_date);
      formData.append("description", form.description.trim());
      formData.append("status", form.status);

      formData.append("featured_image", featuredImage);
      formData.append("pdf_file", pdfFile);

      await createEmagazine(formData);

      setSuccess("e-Magazine created successfully.");

      setForm(INITIAL_FORM);
      setFeaturedImage(null);
      setPdfFile(null);
      setShowForm(false);

      await loadMagazines();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create e-Magazine."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    magazine: Emagazine,
    status: "draft" | "published"
  ) {
    try {
      setError("");
      setSuccess("");

      await updateEmagazineStatus(magazine.id, status);

      setSuccess(
        status === "published"
          ? `"${magazine.title}" is now published.`
          : `"${magazine.title}" moved to draft.`
      );

      await loadMagazines();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update magazine status."
      );
    }
  }

  async function handleDelete(magazine: Emagazine) {
    const confirmed = window.confirm(
      `Delete "${magazine.title}" permanently?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteEmagazine(magazine.id);

      setSuccess("e-Magazine deleted successfully.");

      await loadMagazines();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete e-Magazine."
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                <BookOpen className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  E-Magazine
                </h1>

                <p className="text-sm text-slate-500">
                  Manage digital magazines for subscribers
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm((prev) => !prev);
              setError("");
              setSuccess("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {showForm ? (
              <>
                <XCircle className="h-4 w-4" />
                Close
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add E-Magazine
              </>
            )}
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Upload New E-Magazine
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload the cover image and PDF, then publish it for
                active subscribers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Title */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Magazine Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="Example: War of Justice Monthly"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                {/* Issue Number */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Issue Number
                  </label>

                  <input
                    type="text"
                    name="issue_number"
                    value={form.issue_number}
                    onChange={handleInputChange}
                    placeholder="Example: Issue 05"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Publication Date
                  </label>

                  <input
                    type="date"
                    name="publication_date"
                    value={form.publication_date}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Write a short description about this magazine..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Featured Image */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Featured Image / Cover
                  </label>

                  <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-slate-500">
                    <ImageIcon className="mb-3 h-8 w-8 text-slate-400" />

                    <span className="text-sm font-semibold text-slate-700">
                      {featuredImage
                        ? featuredImage.name
                        : "Choose cover image"}
                    </span>

                    <span className="mt-1 text-xs text-slate-500">
                      JPG, PNG, WEBP
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* PDF */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Magazine PDF
                  </label>

                  <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-slate-500">
                    <FileText className="mb-3 h-8 w-8 text-slate-400" />

                    <span className="text-sm font-semibold text-slate-700">
                      {pdfFile ? pdfFile.name : "Choose PDF file"}
                    </span>

                    <span className="mt-1 text-xs text-slate-500">
                      PDF format only
                    </span>

                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handlePdfChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Magazine
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Magazine List */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Magazine Library
              </h2>

              <p className="text-sm text-slate-500">
                {magazines.length} magazine
                {magazines.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-60 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <Loader2 className="h-7 w-7 animate-spin text-slate-500" />
            </div>
          ) : magazines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <BookOpen className="mx-auto mb-4 h-10 w-10 text-slate-400" />

              <h3 className="text-lg font-semibold text-slate-800">
                No e-Magazines yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Click “Add E-Magazine” to upload your first issue.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                        <BookOpen className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          magazine.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {magazine.status === "published"
                          ? "Published"
                          : "Draft"}
                      </span>

                      {magazine.issue_number && (
                        <span className="text-xs font-medium text-slate-500">
                          {magazine.issue_number}
                        </span>
                      )}
                    </div>

                    <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
                      {magazine.title}
                    </h3>

                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays className="h-4 w-4" />

                      {new Date(
                        magazine.publication_date
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>

                    {magazine.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {magazine.description}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2">
                      {magazine.status === "published" ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(magazine, "draft")
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                        >
                          <XCircle className="h-4 w-4" />
                          Move to Draft
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(magazine, "published")
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Publish
                        </button>
                      )}

                      {magazine.pdf_url && (
                        <a
                          href={magazine.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <FileText className="h-4 w-4" />
                          View PDF
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(magazine)}
                        className="ml-auto inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}