"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/providers/auth-provider";

/**
 * Client-side route guard for UX only — redirects unauthorized users
 * away from a route immediately, so they never see a flash of content
 * they can't use. This is NOT the security boundary: every endpoint
 * behind these routes is independently authorized by the Django backend
 * (see IsAuthorRole / IsAdminOrEditor / IsSuperAdmin permission classes),
 * so a user who bypasses this client check still gets a 403 from the API.
 */
export function ProtectedRoute({
  children,
  requireRole,
}: {
  children: React.ReactNode;
  requireRole: "author" | "admin" | "super_admin";
}) {
  const { user, status, isAuthor, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();

  const allowed =
    requireRole === "author" ? isAuthor : requireRole === "admin" ? isAdmin : isSuperAdmin;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && !allowed) {
      router.replace("/");
    }
  }, [status, allowed, router]);

  if (status === "loading" || !user || !allowed) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }

  return <>{children}</>;
}
