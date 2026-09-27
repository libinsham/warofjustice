
"use client";

import { useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Upload,
  FileSpreadsheet,
  Image as ImageIcon,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  X,
  Edit3,
  Eye,
  ChevronDown,
  Sparkles,
  Save,
  RotateCcw,
} from "lucide-react";

type Article = {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string;
  image: string;
  imageName: string;
  status: "Draft" | "Ready" | "Needs review";
};

const categories = [
  "Politics",
  "National",
  "International",
  "Tamil Nadu",
  "Business",
  "Technology",
  "Education",
  "Entertainment",
  "Sports",
  "Health",
];

const createArticle = (): Article => ({
  id: crypto.randomUUID(),
  title: "",
  content: "",
  excerpt: "",
  category: "National",
  tags: "",
  image: "",
  imageName: "",
  status: "Needs review",
});

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell.trim());
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some((value) => value !== "")) rows.push(row);
  return rows;
}

function csvToArticles(text: string): Article[] {
  const rows = parseCSV(text);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) =>
    h.trim().toLowerCase().replace(/[\s-]+/g, "_")
  );

  const findColumn = (...names: string[]) =>
    names.map((name) => headers.indexOf(name)).find((i) => i >= 0) ?? -1;

  const titleCol = findColumn("title", "headline");
  const contentCol = findColumn("content", "article", "body");
  const excerptCol = findColumn("excerpt", "description", "summary");
  const categoryCol = findColumn("category");
  const tagsCol = findColumn("tags", "keywords");

  if (titleCol < 0 || contentCol < 0) {
    throw new Error(
      "CSV must contain title and content columns. Optional columns: excerpt, category and tags."
    );
  }

  return rows.slice(1).map((row) => {
    const category = categoryCol >= 0 ? row[categoryCol] : "";
    return {
      ...createArticle(),
      title: row[titleCol] ?? "",
      content: row[contentCol] ?? "",
      excerpt: excerptCol >= 0 ? row[excerptCol] ?? "" : "",
      category: categories.includes(category) ? category : "National",
      tags: tagsCol >= 0 ? row[tagsCol] ?? "" : "",
    };
  });
}

export default function AIPostPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [csvLoading, setCsvLoading] = useState(false);
  const [imageTarget, setImageTarget] = useState<string | null>(null);
  const [showImportHelp, setShowImportHelp] = useState(false);

  const csvRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const counts = useMemo(
    () => ({
      total: articles.length,
      ready: articles.filter(
        (a) => a.title.trim() && a.content.trim() && a.excerpt.trim()
      ).length,
      review: articles.filter(
        (a) => !a.title.trim() || !a.content.trim() || !a.excerpt.trim()
      ).length,
    }),
    [articles]
  );

  const filtered = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Ready" &&
        article.title.trim() &&
        article.content.trim() &&
        article.excerpt.trim()) ||
      (filter === "Needs review" &&
        (!article.title.trim() ||
          !article.content.trim() ||
          !article.excerpt.trim()));

    return matchesSearch && matchesFilter;
  });

  const updateArticle = (id: string, changes: Partial<Article>) => {
    setArticles((current) =>
      current.map((article) =>
        article.id === id ? { ...article, ...changes } : article
      )
    );
  };

  const addArticle = () => {
    const article = createArticle();
    setArticles((current) => [...current, article]);
    setEditing(article.id);
  };

  const deleteArticle = (id: string) => {
    setArticles((current) => current.filter((a) => a.id !== id));
    setSelected((current) => current.filter((item) => item !== id));
    if (editing === id) setEditing(null);
  };

  const toggleSelected = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const importCSV = async (file?: File) => {
    if (!file) return;
    setCsvLoading(true);
    setMessage("");

    try {
      const text = await file.text();
      const imported = csvToArticles(text);
      if (!imported.length) {
        throw new Error("No articles found in the CSV file.");
      }
      setArticles((current) => [...current, ...imported]);
      setMessage(`${imported.length} articles imported successfully.`);
      setSelected([]);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to import CSV."
      );
    } finally {
      setCsvLoading(false);
      if (csvRef.current) csvRef.current.value = "";
    }
  };

  const uploadImage = (file?: File) => {
    if (!file || !imageTarget) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage("Image size must be 10 MB or less.");
      return;
    }

    const image = URL.createObjectURL(file);
    updateArticle(imageTarget, {
      image,
      imageName: file.name,
    });
    setImageTarget(null);
    if (imageRef.current) imageRef.current.value = "";
  };

  const exportJSON = () => {
    const data = articles.filter((a) => selected.includes(a.id));
    if (!data.length) {
      setMessage("Select at least one article to export.");
      return;
    }

    const blob = new Blob(
      [
        JSON.stringify(
          data.map(({ id, image, imageName, ...article }) => article),
          null,
          2
        ),
      ],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "bulk-articles.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const selectAll = () => {
    if (filtered.every((a) => selected.includes(a.id))) {
      setSelected((current) =>
        current.filter((id) => !filtered.some((a) => a.id === id))
      );
    } else {
      setSelected((current) => [
        ...new Set([...current, ...filtered.map((a) => a.id)]),
      ]);
    }
  };

  const isReady = (article: Article) =>
    Boolean(
      article.title.trim() &&
        article.content.trim() &&
        article.excerpt.trim()
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span>Super Admin</span>
              <span>/</span>
              <span className="text-slate-800">Bulk Article Posting</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Bulk Article Posting
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create, organize, review and prepare multiple articles.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowImportHelp((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-100"
            >
              <FileSpreadsheet size={17} />
              CSV format
            </button>
            <button
              onClick={addArticle}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Add article
            </button>
          </div>
        </div>

        {/* Import instructions */}
        {showImportHelp && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
            <div className="mb-2 flex items-center justify-between">
              <strong>CSV import format</strong>
              <button onClick={() => setShowImportHelp(false)}>
                <X size={18} />
              </button>
            </div>
            Your CSV should have a header row with at least these columns:
            <code className="mt-2 block overflow-x-auto rounded-md bg-white p-3 text-xs">
              title,content,excerpt,category,tags
            </code>
            <p className="mt-2">
              The title and content columns are required. The other columns
              are optional. Use UTF-8 encoding for Tamil content.
            </p>
            <button
              onClick={() => {
                const blob = new Blob(
                  [
                    "title,content,excerpt,category,tags\n\"Sample article\",\"Article content goes here\",\"Short summary\",\"National\",\"news,india\"\n",
                  ],
                  { type: "text/csv;charset=utf-8" }
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "article-template.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-white hover:bg-blue-800"
            >
              <Download size={16} />
              Download CSV template
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Total articles
              </span>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <FileText size={20} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold">{counts.total}</p>
            <p className="mt-1 text-xs text-slate-500">Added to this session</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Ready for review
              </span>
              <div className="rounded-lg bg-green-50 p-2 text-green-600">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold">{counts.ready}</p>
            <p className="mt-1 text-xs text-slate-500">
              Title, content and excerpt completed
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Needs attention
              </span>
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                <AlertCircle size={20} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold">{counts.review}</p>
            <p className="mt-1 text-xs text-slate-500">
              Missing required fields
            </p>
          </div>
        </div>

        {/* Import and AI panel */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                <Upload size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">Import articles using CSV</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Import multiple articles in one operation.
                </p>
                <input
                  ref={csvRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => importCSV(e.target.files?.[0])}
                />
                <button
                  onClick={() => csvRef.current?.click()}
                  disabled={csvLoading}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                >
                  <FileSpreadsheet size={17} />
                  {csvLoading ? "Importing..." : "Choose CSV file"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-violet-50 p-3 text-violet-600">
                <Sparkles size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">AI article assistance</h2>
                <p className="mt-1 text-sm text-slate-500">
                  AI-assisted writing, SEO metadata and summaries can be
                  connected to your backend.
                </p>
                <span className="mt-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  AI API integration required
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        {message && (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span>{message}</span>
            <button onClick={() => setMessage("")}>
              <X size={17} />
            </button>
          </div>
        )}

        {/* Article list */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:p-5">
            <div>
              <h2 className="font-semibold">Articles</h2>
              <p className="mt-1 text-xs text-slate-500">
                Edit and check your articles before exporting.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportJSON}
                disabled={selected.length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download size={16} />
                Export selected ({selected.length})
              </button>
              <button
                onClick={() => {
                  setArticles([]);
                  setSelected([]);
                  setEditing(null);
                  setMessage("");
                }}
                disabled={articles.length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
              >
                <RotateCcw size={16} />
                Clear all
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-9 text-sm outline-none focus:border-blue-500 sm:w-48"
              >
                <option>All</option>
                <option>Ready</option>
                <option>Needs review</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="rounded-full bg-slate-100 p-4 text-slate-400">
                <FileText size={30} />
              </div>
              <h3 className="mt-4 font-semibold">No articles found</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Add an article manually or import a CSV file to get started.
              </p>
              <button
                onClick={addArticle}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus size={17} />
                Add your first article
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 text-xs text-slate-500 sm:px-5">
                <input
                  type="checkbox"
                  checked={
                    filtered.length > 0 &&
                    filtered.every((a) => selected.includes(a.id))
                  }
                  onChange={selectAll}
                  aria-label="Select all visible articles"
                  className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                />
                <span>Select all visible articles ({filtered.length})</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filtered.map((article, index) => {
                  const ready = isReady(article);
                  const isEditing = editing === article.id;

                  return (
                    <div key={article.id} className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(article.id)}
                          onChange={() => toggleSelected(article.id)}
                          aria-label={`Select article ${article.title || index + 1}`}
                          className="mt-2 h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-600"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400">
                              ARTICLE {String(index + 1).padStart(2, "0")}
                            </span>
                            {ready ? (
                              <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                Ready for review
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                Needs review
                              </span>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="mt-4 space-y-4">
                              <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                  Article title *
                                </label>
                                <input
                                  value={article.title}
                                  onChange={(e) =>
                                    updateArticle(article.id, {
                                      title: e.target.value,
                                    })
                                  }
                                  placeholder="Enter article headline"
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                              </div>

                              <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                  Article content *
                                </label>
                                <textarea
                                  value={article.content}
                                  onChange={(e) =>
                                    updateArticle(article.id, {
                                      content: e.target.value,
                                    })
                                  }
                                  placeholder="Write or paste the complete article here..."
                                  rows={8}
                                  className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                                <p className="mt-1 text-xs text-slate-400">
                                  {article.content.trim()
                                    ? article.content.trim().split(/\s+/).length
                                    : 0}{" "}
                                  words
                                </p>
                              </div>

                              <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                  Excerpt / SEO description *
                                </label>
                                <textarea
                                  value={article.excerpt}
                                  onChange={(e) =>
                                    updateArticle(article.id, {
                                      excerpt: e.target.value,
                                    })
                                  }
                                  placeholder="Write a short article summary..."
                                  rows={3}
                                  className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                                <p className="mt-1 text-xs text-slate-400">
                                  {article.excerpt.length} characters
                                </p>
                              </div>

                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Category
                                  </label>
                                  <select
                                    value={article.category}
                                    onChange={(e) =>
                                      updateArticle(article.id, {
                                        category: e.target.value,
                                      })
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                  >
                                    {categories.map((category) => (
                                      <option key={category}>{category}</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Tags (comma separated)
                                  </label>
                                  <input
                                    value={article.tags}
                                    onChange={(e) =>
                                      updateArticle(article.id, {
                                        tags: e.target.value,
                                      })
                                    }
                                    placeholder="news, india, politics"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                  Featured image
                                </label>
                                <div className="flex flex-wrap items-center gap-3">
                                  {article.image ? (
                                    <img
                                      src={article.image}
                                      alt="Article preview"
                                      className="h-20 w-28 rounded-lg border border-slate-200 object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-20 w-28 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                                      <ImageIcon size={25} />
                                    </div>
                                  )}
                                  <div className="flex flex-col gap-1">
                                    <button
                                      onClick={() => {
                                        setImageTarget(article.id);
                                        imageRef.current?.click();
                                      }}
                                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-50"
                                    >
                                      <Upload size={15} />
                                      Choose image
                                    </button>
                                    {article.imageName && (
                                      <span className="max-w-48 truncate text-xs text-slate-500">
                                        {article.imageName}
                                      </span>
                                    )}
                                    {article.image && (
                                      <button
                                        onClick={() =>
                                          updateArticle(article.id, {
                                            image: "",
                                            imageName: "",
                                          })
                                        }
                                        className="text-left text-xs text-red-600 hover:underline"
                                      >
                                        Remove image
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
                                <button
                                  onClick={() => setEditing(null)}
                                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                                >
                                  Close editor
                                </button>
                                <button
                                  onClick={() => setEditing(null)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                  <Save size={16} />
                                  Done editing
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                              <div className="min-w-0">
                                <h3 className="break-words font-semibold text-slate-900">
                                  {article.title || "Untitled article"}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                                  {article.excerpt ||
                                    "No excerpt has been added yet."}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                  <span>{article.category}</span>
                                  <span>·</span>
                                  <span>
                                    {article.content.trim()
                                      ? article.content
                                          .trim()
                                          .split(/\s+/).length
                                      : 0}{" "}
                                    words
                                  </span>
                                  {article.image && (
                                    <>
                                      <span>·</span>
                                      <span className="inline-flex items-center gap-1">
                                        <ImageIcon size={13} />
                                        Image added
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-2">
                                <button
                                  onClick={() => setEditing(article.id)}
                                  title="Edit article"
                                  className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => deleteArticle(article.id)}
                                  title="Delete article"
                                  className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {articles.length > 0 && (
            <div className="flex flex-col justify-between gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:px-5">
              <p className="text-xs text-slate-500">
                {selected.length} selected · {counts.total} total
              </p>
              <button
                onClick={exportJSON}
                disabled={selected.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download size={16} />
                Export selected articles
              </button>
            </div>
          )}
        </div>

        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => uploadImage(e.target.files?.[0])}
        />

        <p className="text-xs leading-5 text-slate-500">
          Articles are currently managed in the browser session. Connect the
          Django backend to persist drafts, upload images, use AI generation
          and submit articles for approval.
        </p>
      </div>
    </div>
  );
}