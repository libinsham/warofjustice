"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";

export default function SuperSuperAdminDashboard() {
  const {
    user,
    isSuperSuperAdmin,
  } = useAuth();

  if (!isSuperSuperAdmin) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-bold text-red-600">
          Access Denied
        </h1>

        <p className="mt-2 text-sm text-red-500">
          Super Super Admin access is required.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-red-600">
          WAR OF JUSTICE
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Super Super Admin Dashboard
        </h1>

        <p className="mt-2 text-muted-foreground">
          Master administration, AI publishing and system control.
        </p>
      </div>

      {/* =====================================================
          WELCOME
      ===================================================== */}

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Signed in as
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          {user?.username}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {user?.email}
        </p>

        <div className="mt-4 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          SUPER SUPER ADMIN
        </div>
      </div>

      {/* =====================================================
          SYSTEM OVERVIEW
      ===================================================== */}

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          System Overview
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <DashboardCard
            title="Total Users"
            value="—"
          />

          <DashboardCard
            title="Total Authors"
            value="—"
          />

          <DashboardCard
            title="Pending Applications"
            value="—"
          />

          <DashboardCard
            title="Published Posts"
            value="—"
          />

        </div>
      </div>

      {/* =====================================================
          MASTER CONTROLS
      ===================================================== */}

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Master Controls
        </h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

          {/* =================================================
              AI POST GENERATOR
          ================================================= */}

          <ControlCard
            href="/super-admin/ai-post"
            title="AI Post Generator"
            description="Upload a magazine PDF, detect articles, extract images, generate post drafts in batches and send them through QC before publishing."
            featured
          />

          {/* =================================================
              USER MANAGEMENT
          ================================================= */}

          <ControlCard
            href="/super-admin/users"
            title="User Management"
            description="Manage all registered users and account status."
          />

          {/* =================================================
              ROLES
          ================================================= */}

          <ControlCard
            href="/super-admin/roles"
            title="Roles & Permissions"
            description="Manage system roles and access permissions."
          />

          {/* =================================================
              CONTENT
          ================================================= */}

          <ControlCard
            href="/super-admin/posts"
            title="Content Management"
            description="Control posts, publishing and editorial workflow."
          />

          {/* =================================================
              MEDIA
          ================================================= */}

          <ControlCard
            href="/super-admin/media"
            title="Media & Videos"
            description="Manage images, videos and uploaded media."
          />

          {/* =================================================
              SECURITY
          ================================================= */}

          <ControlCard
            href="/super-admin/security"
            title="Security"
            description="Review security settings and system access."
          />

          {/* =================================================
              AUDIT LOGS
          ================================================= */}

          <ControlCard
            href="/super-admin/audit-logs"
            title="Audit Logs"
            description="Review important administrative actions."
          />

          {/* =================================================
              ADMIN MANAGEMENT
          ================================================= */}

          <ControlCard
            href="/super-admin/admins"
            title="Admin Management"
            description="Manage Admin and Super Admin accounts and their access."
          />

          {/* =================================================
              MEMBER MANAGEMENT
          ================================================= */}

          <ControlCard
            href="/super-admin/members"
            title="Members & Contributors"
            description="Review and manage members, contributors and publishing access."
          />

          {/* =================================================
              SYSTEM SETTINGS
          ================================================= */}

          <ControlCard
            href="/super-admin/settings"
            title="System Settings"
            description="Manage global War of Justice platform configuration."
          />

        </div>
      </div>

    </div>
  );
}


/* =========================================================
   DASHBOARD CARD
========================================================= */

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">

      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   CONTROL CARD
========================================================= */

function ControlCard({
  title,
  description,
  href,
  featured = false,
}: {
  title: string;
  description: string;
  href?: string;
  featured?: boolean;
}) {
  const content = (
    <div
      className={[
        "rounded-xl border bg-card p-6 shadow-sm transition-all",
        "hover:-translate-y-0.5 hover:shadow-md",
        featured
          ? "border-red-200 bg-red-50/40"
          : "",
      ].join(" ")}
    >

      {/* =====================================================
          FEATURE LABEL
      ===================================================== */}

      {featured && (
        <div className="mb-4 inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
          AI POWERED
        </div>
      )}

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {href && (
        <div className="mt-4 text-sm font-semibold text-red-600">
          Open →
        </div>
      )}

    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="block focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      {content}
    </Link>
  );
}