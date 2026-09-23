"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  Search,
  User as UserIcon,
  X,
  BookOpen,
  Gem,
  LogOut,
  ShieldCheck,
  PencilLine,
  LayoutDashboard,
  Radio,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  NAV_CATEGORIES,
  SITE_NAME,
  SITE_SLOGAN,
} from "@/lib/site-config";

import { useAuth } from "@/providers/auth-provider";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.warofjustice.news/api/v1";

export function SiteHeader() {
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [flashNews, setFlashNews] = useState<{ id: number | string; title: string; slug?: string | null }[]>([]);

  const {
    user,
    status,
    isAdmin,
    logout,
  } = useAuth();

  const roleName = user?.role?.name;

  useEffect(() => {
    let cancelled = false;

    const loadFlashNews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/posts/?page=1`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();
        const posts = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        if (!cancelled) {
          setFlashNews(
            posts
              .filter((post: any) => post?.title)
              .slice(0, 1)
              .map((post: any) => ({
                id: post.id,
                title: post.title,
                slug: post.slug,
              })),
          );
        }
      } catch (error) {
        console.error("Failed to load flash news:", error);
      }
    };

    loadFlashNews();

    return () => {
      cancelled = true;
    };
  }, []);

const isSubscriber =
  String(roleName) === "subscriber";

  // Member & Contributor use the same publishing access.
  // Approved applications currently use the author role.
  const canAccessAuthorStudio =
    roleName === "author";

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40">
      {/* =====================================================
          TOP UTILITY BAR
      ====================================================== */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-sm">
          {/* Date + e-Paper */}
          <div className="flex items-center gap-3 text-neutral-700">
            <span>
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>

            <span className="text-neutral-300">|</span>

            <Link
              href="/latest"
              className="font-semibold text-primary hover:underline"
            >
              e-Paper
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* e-Magazine */}
            <Link
              href="/gallery"
              className="hidden items-center gap-1 text-neutral-700 hover:text-primary sm:flex"
            >
              <BookOpen className="h-4 w-4" />
              e-Magazine
            </Link>

            {/* Subscribe */}
            <Button
              asChild
              size="sm"
              className="uppercase tracking-wide"
            >
              <Link href="/subscribe">
                Subscribe
              </Link>
            </Button>

            {/* =================================================
                AUTHENTICATED USER / LOGIN
            ================================================== */}
            {status === "authenticated" && user ? (
              <>
                {/* Member & Contributor / Author Studio */}
                {canAccessAuthorStudio && !isAdmin && (
                  <Link
                    href="/author/dashboard"
                    className="hidden items-center gap-1 font-semibold text-neutral-700 hover:text-primary sm:flex"
                  >
                    <PencilLine className="h-4 w-4" />
                    Author Studio
                  </Link>
                )}

                {/* Admin Panel */}
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="hidden items-center gap-1 font-semibold text-neutral-700 hover:text-primary sm:flex"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}

                {/* Subscriber Dashboard */}
                {isSubscriber && (
                  <Link
                    href="/subscriber/dashboard"
                    className="hidden items-center gap-1 font-semibold text-neutral-700 hover:text-primary sm:flex"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Subscriber Dashboard
                  </Link>
                )}

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1 font-semibold text-neutral-700 hover:text-primary"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 font-semibold text-neutral-700 hover:text-primary"
              >
                <UserIcon className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN MASTHEAD
      ====================================================== */}
      <div className="bg-gradient-to-b from-primary to-red-800 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          {/* Menu + Search */}
          <div className="flex shrink-0 items-center gap-1">
            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() =>
                setMobileOpen((value) => !value)
              }
              aria-label="Toggle navigation"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>

            {/* Desktop search */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden text-white hover:bg-white/10 hover:text-white lg:inline-flex"
              onClick={() =>
                setSearchOpen((value) => !value)
              }
              aria-label="Toggle search"
            >
              {searchOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* =================================================
              LOGO
          ================================================== */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label={SITE_NAME}
          >
            <Image
              src="/logo.png"
              alt={SITE_NAME}
              width={150}
              height={100}
              priority
              className="h-20 w-32 object-contain sm:h-24 sm:w-40"
            />
          </Link>

          {/* =================================================
              SITE TITLE
          ================================================== */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-black leading-none tracking-tight sm:text-4xl lg:text-5xl">
              WAR{" "}
              <span className="mx-1 inline-block rounded bg-yellow-400 px-2 py-0.5 align-middle text-xl text-black sm:text-2xl lg:text-3xl">
                OF
              </span>{" "}
              JUSTICE
            </h1>

            <p className="mt-1 hidden rounded bg-yellow-400 px-3 py-1 text-center text-xs font-bold tracking-wide text-black sm:inline-block sm:text-sm">
              {SITE_SLOGAN}
            </p>
          </div>

          {/* =================================================
              PARTNER BADGES
          ================================================== */}
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <Image
              src="/today-news-badge.png"
              alt="Today News"
              width={90}
              height={60}
              className="h-14 w-auto object-contain"
            />

            <Image
              src="/news-24-7-badge.png"
              alt="News 24/7"
              width={70}
              height={90}
              className="h-16 w-auto object-contain"
            />
          </div>
        </div>

        {/* =================================================
            SEARCH PANEL
        ================================================== */}
        {searchOpen && (
          <div className="border-t border-white/20 px-4 py-3">
            <form
              className="mx-auto max-w-2xl"
              onSubmit={(event) => {
                event.preventDefault();

                const form = new FormData(
                  event.currentTarget,
                );

                const query = form
                  .get("q")
                  ?.toString()
                  .trim();

                if (!query) {
                  return;
                }

                router.push(
                  `/search?q=${encodeURIComponent(query)}`,
                );

                setSearchOpen(false);
              }}
            >
              <Input
                name="q"
                autoFocus
                placeholder="Search articles, categories, tags…"
                className="bg-white text-black"
              />
            </form>
          </div>
        )}
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ====================================================== */}
      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-b bg-white px-4 py-3 lg:hidden">
          {NAV_CATEGORIES.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-2 text-sm font-bold uppercase hover:bg-accent"
              onClick={() =>
                setMobileOpen(false)
              }
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/register"
            className="flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-bold uppercase hover:bg-accent"
            onClick={() =>
              setMobileOpen(false)
            }
          >
            Premium
            <Gem className="h-4 w-4 text-yellow-500" />
          </Link>

          {/* Mobile authenticated dashboard links */}
          {status === "authenticated" && user && (
            <>
              {/* Author Studio */}
              {canAccessAuthorStudio && !isAdmin && (
                <Link
                  href="/author/dashboard"
                  className="flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-bold uppercase text-neutral-800 hover:bg-accent hover:text-primary"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                >
                  <PencilLine className="h-4 w-4" />
                  Author Studio
                </Link>
              )}

              {/* Admin Panel */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-bold uppercase text-neutral-800 hover:bg-accent hover:text-primary"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}

              {/* Subscriber Dashboard */}
              {isSubscriber && (
                <Link
                  href="/subscriber/dashboard"
                  className="flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-bold uppercase text-neutral-800 hover:bg-accent hover:text-primary"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Subscriber Dashboard
                </Link>
              )}
            </>
          )}
        </nav>
      )}
      {/* Latest published post marquee */}
      <div className="w-full overflow-hidden border-b border-red-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-stretch">
          <div className="relative z-10 flex shrink-0 items-center bg-red-700 px-3 py-2 text-white sm:px-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
              </span>
              <Radio className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-wider sm:text-xs">Breaking News</span>
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
                      <span className="px-5 text-xs font-semibold text-neutral-800 sm:text-sm">{post.title}</span>
                      <span className="text-red-600">◆</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <span className="flex h-full items-center px-5 text-xs font-medium text-neutral-500 sm:text-sm">Latest news will appear here.</span>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flash-news-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .flash-news-track { animation: flash-news-scroll 30s linear infinite; }
        .flash-news-track:hover { animation-play-state: paused; }
      `}</style>

    </header>
  );
}