"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Clock,
  Image as ImageIcon,
  Users,
  FolderTree,
  Settings,
} from "lucide-react";

import { AuthProvider } from "@/providers/auth-provider";
import { ProtectedRoute } from "@/components/shared/protected-route";
import {
  DashboardSidebar,
  type SidebarItem,
} from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

const ADMIN_NAV: SidebarItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/posts",
    label: "All Posts",
    icon: FileText,
  },
  {
    href: "/admin/posts/pending",
    label: "Pending Review",
    icon: Clock,
  },
  {
    href: "/admin/media",
    label: "Media Library",
    icon: ImageIcon,
  },
  {
    href: "/admin/authors",
    label: "Authors",
    icon: Users,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: FolderTree,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthProvider>
      <ProtectedRoute requireRole="admin">
        <div className="flex min-h-screen">
          <DashboardSidebar
            items={ADMIN_NAV}
            brandLabel="Admin Panel"
            mobileOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
          />

          <div className="flex-1">
            <DashboardTopbar
              title="Admin Panel"
              onMenuClick={() => setMobileOpen(true)}
            />

            <main className="p-4 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}