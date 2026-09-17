"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useState,
  type FormEvent,
} from "react";

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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  NAV_CATEGORIES,
  SITE_NAME,
  SITE_SLOGAN,
} from "@/lib/site-config";

import { useAuth } from "@/providers/auth-provider";

export function SiteHeader() {
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const {
    user,
    status,
    isAdmin,
    logout,
  } = useAuth();

  const roleName = user?.role?.name;

  const isSubscriber =
    String(roleName) === "subscriber";

  const canAccessAuthorStudio =
    roleName === "author";

  /* =========================================================
     LOGOUT
  ========================================================= */
  const handleLogout = async () => {
    try {
      await logout();

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */
  const handleSearchSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const formData = new FormData(
      event.currentTarget,
    );

    const query = formData
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
  };

  return (
    <header className="sticky top-0 z-40">
      {/* =====================================================
          TOP UTILITY BAR
      ====================================================== */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex min-h-[44px] max-w-7xl items-center justify-between gap-4 px-4 text-sm">
          {/* Date + e-Paper */}
          <div className="flex items-center gap-3 text-neutral-700">
            <span className="whitespace-nowrap">
              {new Date().toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}
            </span>

            <span className="text-neutral-300">
              |
            </span>

            <Link
              href="/latest"
              className="font-semibold text-primary transition hover:underline"
            >
              e-Paper
            </Link>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* e-Magazine */}
            <Link
              href="/gallery"
              className="hidden items-center gap-1.5 text-neutral-700 transition hover:text-primary sm:flex"
            >
              <BookOpen className="h-4 w-4" />
              <span>e-Magazine</span>
            </Link>

            {/* Subscribe */}
            <Button
              asChild
              size="sm"
              className="h-8 px-3 text-xs font-bold uppercase tracking-wide"
            >
              <Link href="/subscribe">
                Subscribe
              </Link>
            </Button>

            {/* Authenticated user */}
            {status === "authenticated" && user ? (
              <>
                {/* Author Studio */}
                {canAccessAuthorStudio && !isAdmin && (
                  <Link
                    href="/author/dashboard"
                    className="hidden items-center gap-1.5 font-semibold text-neutral-700 transition hover:text-primary sm:flex"
                  >
                    <PencilLine className="h-4 w-4" />
                    <span>Author Studio</span>
                  </Link>
                )}

                {/* Admin Panel */}
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="hidden items-center gap-1.5 font-semibold text-neutral-700 transition hover:text-primary sm:flex"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* Subscriber Dashboard */}
                {isSubscriber && (
                  <Link
                    href="/subscriber/dashboard"
                    className="hidden items-center gap-1.5 font-semibold text-neutral-700 transition hover:text-primary sm:flex"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Subscriber Dashboard</span>
                  </Link>
                )}

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 font-semibold text-neutral-700 transition hover:text-primary"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              /* Login */
              <Link
                href="/login"
                className="flex items-center gap-1.5 font-semibold text-neutral-700 transition hover:text-primary"
              >
                <UserIcon className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN MASTHEAD
      ====================================================== */}
      <div className="bg-gradient-to-b from-primary to-red-800 text-white">
        <div className="mx-auto flex min-h-[118px] max-w-7xl items-center gap-3 px-4 py-2 sm:min-h-[126px] sm:gap-4 lg:px-6">
          {/* =================================================
              MOBILE MENU
          ================================================== */}
          <div className="shrink-0 lg:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white hover:bg-white/10 hover:text-white"
              onClick={() =>
                setMobileOpen((value) => !value)
              }
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* =================================================
              LEFT — EXISTING EMBLEM
          ================================================== */}
          <Link
            href="/"
            aria-label={SITE_NAME}
            className="flex shrink-0 items-center"
          >
            <Image
              src="/logo.png"
              alt={SITE_NAME}
              width={180}
              height={125}
              priority
              className="
                h-[74px] w-[104px]
                object-contain
                sm:h-[86px] sm:w-[122px]
                lg:h-[96px] lg:w-[138px]
              "
            />
          </Link>

          {/* =================================================
              CENTER — BRANDING
          ================================================== */}
          <div className="min-w-0 flex-1 text-center">
            <h1
              className="
                truncate
                text-[30px]
                font-black
                leading-none
                tracking-tight
                sm:text-[38px]
                lg:text-[50px]
              "
            >
              WAR{" "}
              <span
                className="
                  mx-1
                  inline-block
                  rounded-md
                  bg-yellow-400
                  px-2
                  py-0.5
                  align-middle
                  text-[20px]
                  text-black
                  sm:px-2.5
                  sm:text-[25px]
                  lg:text-[31px]
                "
              >
                OF
              </span>{" "}
              JUSTICE
            </h1>

            <p
              className="
                mt-1.5
                inline-block
                rounded-md
                bg-yellow-400
                px-3
                py-1
                text-[9px]
                font-extrabold
                leading-tight
                tracking-wide
                text-black
                sm:text-[11px]
                lg:text-sm
              "
            >
              {SITE_SLOGAN}
            </p>
          </div>

          {/* =================================================
              RIGHT — LARGE BADGES + SEARCH
          ================================================== */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-4 lg:gap-5">
            {/* Partner badges */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Press Today News */}
              <Image
                src="/today-news-badge.png"
                alt="Today News"
                width={120}
                height={80}
                className="
                  h-[56px] w-auto
                  sm:h-[68px]
                  lg:h-[80px]
                  object-contain
                "
              />

              {/* News 24/7 */}
              <Image
                src="/news-24-7-badge.png"
                alt="News 24/7"
                width={90}
                height={120}
                className="
                  h-[64px] w-auto
                  sm:h-[76px]
                  lg:h-[88px]
                  object-contain
                "
              />
            </div>

            {/* Search */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="
                h-10 w-10
                text-white
                hover:bg-white/10
                hover:text-white
                sm:h-11 sm:w-11
                lg:h-12 lg:w-12
              "
              onClick={() =>
                setSearchOpen((value) => !value)
              }
              aria-label="Toggle search"
              aria-expanded={searchOpen}
            >
              {searchOpen ? (
                <X className="h-6 w-6 lg:h-7 lg:w-7" />
              ) : (
                <Search className="h-6 w-6 lg:h-7 lg:w-7" />
              )}
            </Button>
          </div>
        </div>

        {/* =================================================
            SEARCH PANEL
        ================================================== */}
        {searchOpen && (
          <div className="border-t border-white/20 px-4 py-3">
            <form
              onSubmit={handleSearchSubmit}
              className="mx-auto max-w-2xl"
            >
              <Input
                name="q"
                type="search"
                autoFocus
                placeholder="Search articles, categories, tags..."
                className="h-11 bg-white text-black placeholder:text-neutral-500"
              />
            </form>
          </div>
        )}
      </div>

      {/* =====================================================
          DESKTOP CATEGORY NAVIGATION — HIDDEN
          
          Kept here for future use.
      ====================================================== */}

      {/*
      <div className="border-b-2 border-primary bg-white">
        <nav className="mx-auto hidden max-w-7xl items-center gap-6 px-4 py-3 text-sm font-bold uppercase tracking-wide lg:flex">
          {NAV_CATEGORIES.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-neutral-800 transition hover:text-primary"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/register"
            className="ml-auto flex items-center gap-1.5 text-neutral-800 transition hover:text-primary"
          >
            Premium
            <Gem className="h-4 w-4 text-yellow-500" />
          </Link>
        </nav>
      </div>
      */}

      {/* =====================================================
          MOBILE NAVIGATION
      ====================================================== */}
      {mobileOpen && (
        <nav className="border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_CATEGORIES.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="
                  rounded-md
                  px-3
                  py-2.5
                  text-sm
                  font-bold
                  uppercase
                  tracking-wide
                  text-neutral-800
                  transition
                  hover:bg-accent
                  hover:text-primary
                "
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                {link.label}
              </Link>
            ))}

            {/* Premium */}
            <Link
              href="/register"
              className="
                flex
                items-center
                gap-1.5
                rounded-md
                px-3
                py-2.5
                text-sm
                font-bold
                uppercase
                tracking-wide
                text-neutral-800
                transition
                hover:bg-accent
                hover:text-primary
              "
              onClick={() =>
                setMobileOpen(false)
              }
            >
              Premium
              <Gem className="h-4 w-4 text-yellow-500" />
            </Link>

            {/* =================================================
                MOBILE AUTH LINKS
            ================================================== */}
            {status === "authenticated" &&
              user && (
                <>
                  {/* Author Studio */}
                  {canAccessAuthorStudio &&
                    !isAdmin && (
                      <Link
                        href="/author/dashboard"
                        className="
                          flex
                          items-center
                          gap-1.5
                          rounded-md
                          px-3
                          py-2.5
                          text-sm
                          font-bold
                          uppercase
                          tracking-wide
                          text-neutral-800
                          transition
                          hover:bg-accent
                          hover:text-primary
                        "
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
                      href="/admin/dashboard"
                      className="
                        flex
                        items-center
                        gap-1.5
                        rounded-md
                        px-3
                        py-2.5
                        text-sm
                        font-bold
                        uppercase
                        tracking-wide
                        text-neutral-800
                        transition
                        hover:bg-accent
                        hover:text-primary
                      "
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
                      className="
                        flex
                        items-center
                        gap-1.5
                        rounded-md
                        px-3
                        py-2.5
                        text-sm
                        font-bold
                        uppercase
                        tracking-wide
                        text-neutral-800
                        transition
                        hover:bg-accent
                        hover:text-primary
                      "
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
          </div>
        </nav>
      )}
    </header>
  );
}