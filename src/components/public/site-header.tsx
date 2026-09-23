"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  Search,
  User as UserIcon,
  BookOpen,
  LogOut,
  ShieldCheck,
  PencilLine,
  LayoutDashboard,
  Radio,
  X,
} from "lucide-react";

import { SITE_NAME, SITE_SLOGAN } from "@/lib/site-config";
import { useAuth } from "@/providers/auth-provider";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.warofjustice.news/api/v1";

type FlashPost = {
  id: number | string;
  title: string;
  slug?: string | null;
};

export function SiteHeader() {
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [flashNews, setFlashNews] = useState<FlashPost[]>([]);

  const { user, status, isAdmin, logout } = useAuth();

  const roleName = user?.role?.name;
  const isSubscriber = String(roleName) === "subscriber";
  const canAccessAuthorStudio = roleName === "author";

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const loadFlashNews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/posts/?page=1`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const posts = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        const latest: FlashPost[] = posts
          .filter((post: unknown): post is { id: number | string; title: string; slug?: string | null } => {
            if (!post || typeof post !== "object") return false;
            const value = post as { id?: unknown; title?: unknown; slug?: unknown };
            return (
              (typeof value.id === "string" || typeof value.id === "number") &&
              typeof value.title === "string" &&
              value.title.trim().length > 0
            );
          })
          .slice(0, 1)
          .map((post: { id: number | string; title: string; slug?: string | null }) => ({
            id: post.id,
            title: post.title,
            slug: typeof post.slug === "string" ? post.slug : null,
          }));

        if (!cancelled) {
          setFlashNews(latest);
        }
      } catch {
        // The breaking-news ticker is optional.
        // Never log or rethrow a network/CORS failure.
        if (!cancelled) {
          setFlashNews([]);
        }
      }
    };

    void loadFlashNews();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) {
      return;
    }

    router.push(`/search?q=${encodeURIComponent(query)}`);
    setSearchQuery("");
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* =========================================================
          TOP UTILITY BAR
      ========================================================== */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-2 text-xs sm:px-6 sm:text-sm">
          <div className="flex min-w-0 items-center gap-3 text-neutral-700">
            <span className="whitespace-nowrap">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>

            <span className="text-neutral-300">|</span>

            <Link
              href="/latest"
              className="font-semibold text-red-700 hover:underline"
            >
              e-Paper
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/subscriber/emagazine/"
              className="hidden items-center gap-1 text-neutral-700 hover:text-red-700 sm:flex"
            >
              <BookOpen className="h-4 w-4" />
              e-Magazine
            </Link>

            <Link
              href="/subscribe"
              className="rounded-md bg-red-700 px-3 py-1.5 font-semibold uppercase tracking-wide text-white transition hover:bg-red-800"
            >
              Subscribe
            </Link>

            {status === "authenticated" && user ? (
              <>
                {canAccessAuthorStudio && !isAdmin && (
                  <Link
                    href="/author/dashboard"
                    className="hidden items-center gap-1 font-semibold text-neutral-700 hover:text-red-700 md:flex"
                  >
                    <PencilLine className="h-4 w-4" />
                    Author Studio
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="hidden items-center gap-1 font-semibold text-neutral-700 hover:text-red-700 md:flex"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}

                {isSubscriber && (
                  <Link
                    href="/subscriber/dashboard"
                    className="hidden items-center gap-1 font-semibold text-neutral-700 hover:text-red-700 md:flex"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Subscriber Dashboard
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1 font-semibold text-neutral-700 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 font-semibold text-neutral-700 hover:text-red-700"
              >
                <UserIcon className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN RED MASTHEAD
          Centered title with balanced left/right content.
      ========================================================== */}
      <div className="overflow-x-hidden bg-red-700 text-white">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="relative flex min-h-[92px] items-center py-3 sm:min-h-[125px] sm:py-5 lg:min-h-[160px] lg:py-6">
            {/* LOGO */}
            <Link
              href="/"
              aria-label={SITE_NAME}
              className="relative z-20 flex shrink-0 items-center"
            >
              <Image
                src="/logo.png"
                alt={SITE_NAME}
                width={150}
                height={150}
                priority
                className="h-16 w-16 object-contain sm:h-24 sm:w-24 lg:h-28 lg:w-28"
              />
            </Link>

            {/* CENTER TITLE */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-20 sm:px-28 lg:px-44">
              <Link
                href="/"
                aria-label={SITE_NAME}
                className="pointer-events-auto block max-w-full"
              >
                <h1 className="whitespace-nowrap text-center text-[2rem] font-black uppercase leading-none tracking-[-0.04em] text-white sm:text-[3.6rem] lg:text-[5.25rem]">
                  WAR OF JUSTICE
                </h1>
              </Link>
            </div>

            {/* RIGHT BADGES + SEARCH */}
            <div className="relative z-20 ml-auto flex shrink-0 items-center gap-2 sm:gap-4 lg:gap-5">
              <div className="hidden items-center gap-2 sm:flex lg:gap-4">
                <Image
                  src="/today-news-badge.png"
                  alt="Press Today News"
                  width={150}
                  height={90}
                  className="h-14 w-auto object-contain sm:h-16 lg:h-[76px]"
                />

                <Image
                  src="/news-24-7-badge.png"
                  alt="News 24/7"
                  width={95}
                  height={120}
                  className="h-14 w-auto object-contain sm:h-16 lg:h-20"
                />
              </div>

              <button
                type="button"
                onClick={() => setSearchOpen((value) => !value)}
                aria-label={searchOpen ? "Close search" : "Open search"}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/10 sm:h-10 sm:w-10"
              >
                {searchOpen ? (
                  <X className="h-6 w-6 sm:h-7 sm:w-7" />
                ) : (
                  <Search className="h-6 w-6 sm:h-7 sm:w-7" />
                )}
              </button>
            </div>
          </div>

          {/* SEARCH PANEL */}
          {searchOpen && (
            <div className="border-t border-white/20 py-3 sm:py-4">
              <form
                onSubmit={handleSearchSubmit}
                className="mx-auto flex w-full max-w-3xl gap-2"
              >
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  autoFocus
                  placeholder="Search articles, categories, tags..."
                  className="h-10 min-w-0 flex-1 rounded-md border border-white/20 bg-white px-3 text-sm text-black outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-yellow-400 sm:h-11 sm:px-4"
                />

                <button
                  type="submit"
                  className="h-10 rounded-md bg-white px-4 text-sm font-bold text-red-700 transition hover:bg-white/90 sm:h-11 sm:px-5"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          STATIC YELLOW SLOGAN STRIP
      ========================================================== */}
      <div className="border-b border-yellow-500 bg-yellow-400">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-center px-4 py-2.5 sm:px-6 sm:py-3">
          <p className="text-center text-[11px] font-black uppercase leading-snug tracking-tight text-black sm:text-base lg:text-xl">
            {SITE_SLOGAN}
          </p>
        </div>
      </div>

      {/* =========================================================
          LATEST PUBLISHED POST / BREAKING NEWS TICKER
      ========================================================== */}
      <div className="w-full overflow-hidden border-b border-red-100 bg-white">
        <div className="mx-auto flex w-full max-w-[1280px] items-stretch">
          <div className="relative z-10 flex shrink-0 items-center bg-red-700 px-3 py-3 text-white sm:px-5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
              </span>

              <Radio className="h-4 w-4 shrink-0" />

              <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-wider sm:text-xs">
                Breaking News
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1 overflow-hidden bg-red-50">
            {flashNews.length > 0 ? (
              <div className="flex h-full items-center overflow-hidden">
                <div className="flash-news-track flex min-w-max items-center whitespace-nowrap">
                  {[...flashNews, ...flashNews].map((post, index) => (
                    <Link
                      key={`${post.id}-${index}`}
                      href={post.slug ? `/article/${post.slug}` : "/latest"}
                      className="flex items-center transition hover:text-red-700"
                    >
                      <span className="px-5 text-xs font-semibold text-neutral-800 sm:text-sm">
                        {post.title}
                      </span>
                      <span className="text-red-600">◆</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <span className="flex h-full items-center px-5 text-xs font-medium text-neutral-500 sm:text-sm">
                Latest news will appear here.
              </span>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flash-news-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .flash-news-track {
          animation: flash-news-scroll 35s linear infinite;
        }

        .flash-news-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </header>
  );
}
