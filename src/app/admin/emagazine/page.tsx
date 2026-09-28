
"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
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
  updateEmagazine,
  updateEmagazineStatus,
} from "@/lib/api/emagazines";

import type { Emagazine } from "@/types/emagazine";

type MagazineForm = {
  title: string;
  issue_number: string;
  publication_date: string;
  description: string;
  status: "draft" | "published";
};

const INITIAL_FORM: MagazineForm = {
  title: "",
  issue_number: "",
  publication_date: "",
  description: "",
  status: "draft",
};

export default function AdminEmagazinePage() {
  const [magazines, setMagazines] = useState<Emagazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<MagazineForm>(INITIAL_FORM);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const editingMagazine =
    editingId === null
      ? null
      : magazines.find((magazine) => magazine.id === editingId) ?? null;

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

  function resetForm() {
    setForm(INITIAL_FORM);
    setFeaturedImage(null);
    setPdfFile(null);
    setEditingId(null);
  }

  function openCreateForm() {
    resetForm();
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    resetForm();
    setError("");
    setShowForm(false);
  }

  function handleEdit(magazine: Emagazine) {
    setEditingId(magazine.id);

    setForm({
      title: magazine.title ?? "",
      issue_number: magazine.issue_number ?? "",
      publication_date: magazine.publication_date
        ? magazine.publication_date.slice(0, 10)
        : "",
      description: magazine.description ?? "",
      status:
        magazine.status === "published" ? "published" : "draft",
    });

    setFeaturedImage(null);
    setPdfFile(null);
    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleInputChange(
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
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

    // On creation, both files are required.
    // During editing, both files can be left unchanged.
    if (editingId === null && !featuredImage) {
      setError("Featured image / cover image is required.");
      return;
    }

    if (editingId === null && !pdfFile) {
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

      // Only send replacement files when selected.
      // Omitting these fields keeps the existing files.
      if (featuredImage) {
        formData.append("featured_image", featuredImage);
      }

      if (pdfFile) {
        formData.append("pdf_file", pdfFile);
      }

      if (editingId !== null) {
        await updateEmagazine(editingId, formData);
        setSuccess("E-Magazine updated successfully.");
      } else {
        await createEmagazine(formData);
        setSuccess("E-Magazine created successfully.");
      }

      resetForm();
      setShowForm(false);

      await loadMagazines();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : editingId !== null
            ? "Unable to update e-Magazine."
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

      if (editingId === magazine.id) {
        closeForm();
      }

      setSuccess("E-Magazine deleted successfully.");
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
              if (showForm) {
                closeForm();
              } else {
                openCreateForm();
              }
            }}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
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
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Create / Edit Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId !== null
                  ? "Edit E-Magazine"
                  : "Upload New E-Magazine"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editingId !== null
                  ? "Update the magazine details. Existing files will be kept unless you select replacements."
                  : "Upload the cover image and PDF, then publish it for active subscribers."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Title */}
                <div>
                  <label
                    htmlFor="magazine-title"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Magazine Title
                  </label>

                  <input
                    id="magazine-title"
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="Example: War of Justice Monthly"
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />
                </div>

                {/* Issue Number */}
                <div>
                  <label
                    htmlFor="magazine-issue"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Issue Number
                  </label>

                  <input
                    id="magazine-issue"
                    type="text"
                    name="issue_number"
                    value={form.issue_number}
                    onChange={handleInputChange}
                    placeholder="Example: Issue 05"
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />
                </div>

                {/* Date */}
                <div>
                  <label
                    htmlFor="magazine-date"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Publication Date
                  </label>

                  <input
                    id="magazine-date"
                    type="date"
                    name="publication_date"
                    value={form.publication_date}
                    onChange={handleInputChange}
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="magazine-status"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Status
                  </label>

                  <select
                    id="magazine-status"
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="magazine-description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="magazine-description"
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Write a short description about this magazine..."
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Featured Image */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Featured Image / Cover
                  </label>

                  {editingMagazine?.featured_image_url && (
                    <div className="mb-3 space-y-2">
                      <p className="text-xs font-medium text-slate-500">
                        Current cover
                      </p>

                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editingMagazine.featured_image_url}
                        alt="Current magazine cover"
                        className="h-40 w-full rounded-lg border border-slate-200 object-cover"
                      />
                    </div>
                  )}

                  <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-slate-500">
                    <ImageIcon className="mb-3 h-8 w-8 text-slate-400" />

                    <span className="text-sm font-semibold text-slate-700">
                      {featuredImage
                        ? featuredImage.name
                        : editingId !== null
                          ? "Choose replacement cover"
                          : "Choose cover image"}
                    </span>

                    <span className="mt-1 text-xs text-slate-500">
                      JPG, PNG, WEBP
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={saving}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* PDF */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Magazine PDF
                  </label>

                  {editingMagazine?.pdf_url && (
                    <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="mb-2 text-xs font-medium text-slate-500">
                        Current PDF
                      </p>

                      <a
                        href={editingMagazine.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        View current PDF
                      </a>
                    </div>
                  )}

                  <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-slate-500">
                    <FileText className="mb-3 h-8 w-8 text-slate-400" />

                    <span className="text-sm font-semibold text-slate-700">
                      {pdfFile
                        ? pdfFile.name
                        : editingId !== null
                          ? "Choose replacement PDF"
                          : "Choose PDF file"}
                    </span>

                    <span className="mt-1 text-xs text-slate-500">
                      PDF format only
                    </span>

                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handlePdfChange}
                      disabled={saving}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Form actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editingId !== null
                        ? "Updating..."
                        : "Uploading..."}
                    </>
                  ) : editingId !== null ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Update Magazine
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

        {/* Magazine Library */}
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
                Click "Add E-Magazine" to upload your first issue.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {magazines.map((magazine) => (
                <article
                  key={magazine.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                    {magazine.featured_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
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

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleEdit(magazine)}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>

                      {/* Draft / Publish */}
                      {magazine.status === "published" ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(magazine, "draft")
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
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
                          className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Publish
                        </button>
                      )}

                      {/* View PDF */}
                      {magazine.pdf_url && (
                        <a
                          href={magazine.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <FileText className="h-4 w-4" />
                          View PDF
                        </a>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(magazine)}
                        disabled={saving}
                        className="ml-auto inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        title="Delete"
                        aria-label={`Delete ${magazine.title}`}
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