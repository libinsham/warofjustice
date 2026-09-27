
"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  KeyRound,
  FileText,
  Clock,
  Image as ImageIcon,
  Video,
  BookOpen,
  UsersRound,
  FolderTree,
  ScrollText,
  LockKeyhole,
  Settings,
  Sparkles,
  FilePlus,
  Files,
} from "lucide-react";

import { QueryProvider } from "@/providers/query-provider";
import { ProtectedRoute } from "@/components/shared/protected-route";

import {
  DashboardSidebar,
  type SidebarItem,
} from "@/components/dashboard/dashboard-sidebar";

import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

const SUPER_ADMIN_NAV: SidebarItem[] = [
  {
    href: "/super-admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },

  {
    href: "/super-admin/ai-post",
    label: "AI Post Generator",
    icon: Sparkles,
  },

  {
    href: "/super-admin/posts/new",
    label: "Create Post",
    icon: FilePlus,
  },

  {
    href: "/super-admin/posts/bulk",
    label: "Bulk Posts",
    icon: Files,
  },

  {
    href: "/super-admin/users",
    label: "Users",
    icon: Users,
  },

  {
    href: "/super-admin/admins",
    label: "Admins",
    icon: ShieldCheck,
  },

  {
    href: "/super-admin/roles",
    label: "Roles & Permissions",
    icon: KeyRound,
  },

  {
    href: "/super-admin/posts",
    label: "All Posts",
    icon: FileText,
  },

  {
    href: "/super-admin/posts/pending",
    label: "Pending Review",
    icon: Clock,
  },

  {
    href: "/super-admin/media",
    label: "Media Library",
    icon: ImageIcon,
  },

  {
    href: "/super-admin/videos",
    label: "Videos",
    icon: Video,
  },

  {
    href: "/super-admin/emagazine",
    label: "E-Magazine",
    icon: BookOpen,
  },

  {
    href: "/super-admin/authors",
    label: "Authors",
    icon: Users,
  },

  {
    href: "/super-admin/members",
    label: "Member & Contributor",
    icon: UsersRound,
  },

  {
    href: "/super-admin/subscribers",
    label: "Subscribers",
    icon: UsersRound,
  },

  {
    href: "/super-admin/categories",
    label: "Categories",
    icon: FolderTree,
  },

  {
    href: "/super-admin/audit-logs",
    label: "Audit Logs",
    icon: ScrollText,
  },

  {
    href: "/super-admin/security",
    label: "Security",
    icon: LockKeyhole,
  },

  {
    href: "/super-admin/settings",
    label: "System Settings",
    icon: Settings,
  },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <QueryProvider>
      <ProtectedRoute requireRole="super_super_admin">
        <div className="flex min-h-screen">
          <DashboardSidebar
            items={SUPER_ADMIN_NAV}
            brandLabel="Super Super Admin"
            mobileOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
          />

          <div className="flex-1">
            <DashboardTopbar
              title="Super Super Admin Panel"
              onMenuClick={() => setMobileOpen(true)}
            />

            <main className="p-4 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </ProtectedRoute>
    </QueryProvider>
  );
}