"use client";

import { useAuth } from "@/providers/auth-provider";

export default function SuperAdminDashboardPage() {
  const { user, isSuperSuperAdmin } = useAuth();

  if (!isSuperSuperAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold text-red-600">
          Access Denied
        </h1>
        <p className="mt-2 text-muted-foreground">
          Super Super Admin access is required.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-red-600">
          War of Justice
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Super Super Admin Panel
        </h1>

        <p className="mt-2 text-muted-foreground">
          Master administration and system control.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Total Users
          </p>
          <p className="mt-2 text-3xl font-bold">—</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Pending Applications
          </p>
          <p className="mt-2 text-3xl font-bold">—</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Authors
          </p>
          <p className="mt-2 text-3xl font-bold">—</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Published Posts
          </p>
          <p className="mt-2 text-3xl font-bold">—</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          Welcome, {user?.username}
        </h2>

        <p className="mt-2 text-muted-foreground">
          You are logged in as Super Super Admin.
        </p>
      </div>
    </div>
  );
}