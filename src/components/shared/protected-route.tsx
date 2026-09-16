"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";

/**
 * Client-side route guard for UX only.
 *
 * Backend APIs remain the real security boundary.
 *
 * Supported roles:
 * - author
 * - admin
 * - super_admin
 */
export function ProtectedRoute({
  children,
  requireRole,
}: {
  children: React.ReactNode;
  requireRole: "author" | "admin" | "super_admin";
}) {
  const {
    user,
    status,
    isAuthor,
    isAdmin,
    isSuperAdmin,
    refresh,
  } = useAuth();

  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(
    status === "unauthenticated" && !user,
  );

  /*
   * Important:
   * AuthProvider may initially start as "unauthenticated"
   * when autoLoadUser is false.
   *
   * Before redirecting to /login, give the existing JWT
   * session a chance to load through /auth/me/.
   */
  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      if (status === "authenticated" && user) {
        if (!cancelled) {
          setCheckingSession(false);
        }
        return;
      }

      if (status === "loading") {
        return;
      }

      /*
       * Try to restore the authenticated user from the
       * existing access/refresh token.
       */
      if (status === "unauthenticated" && !user) {
        try {
          if (!cancelled) {
            setCheckingSession(true);
          }

          await refresh();
        } finally {
          if (!cancelled) {
            setCheckingSession(false);
          }
        }
      }
    };

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [status, user, refresh]);

  /*
   * Determine access from the actual authenticated user
   * as well as the AuthProvider role helpers.
   */
  const roleName = user?.role?.name;

const allowed =
  requireRole === "author"
    ? isAuthor
    : requireRole === "admin"
      ? isAdmin
      : isSuperAdmin;

  /*
   * Redirect only after the session check has completed.
   */
  useEffect(() => {
    if (checkingSession || status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && user && !allowed) {
      router.replace("/");
    }
  }, [
    checkingSession,
    status,
    user,
    allowed,
    router,
  ]);

  /*
   * Prevent flashing protected content while authentication
   * is being restored.
   */
  if (
    checkingSession ||
    status === "loading" ||
    !user
  ) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }

  /*
   * Still render the loading/guard state while redirecting.
   */
  if (!allowed) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }

  return <>{children}</>;
}