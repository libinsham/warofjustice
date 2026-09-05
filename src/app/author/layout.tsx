"use client";

import { useState } from "react";
import { LayoutDashboard, FileText, PlusCircle, Image as ImageIcon, User, Settings } from "lucide-react";

import { ProtectedRoute } from "@/components/shared/protected-route";
import { DashboardSidebar, type SidebarItem } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

const AUTHOR_NAV: SidebarItem[] = [
  { href: "/author/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/author/posts", label: "My Posts", icon: FileText },
  { href: "/author/posts/new", label: "Create Post", icon: PlusCircle },
  { href: "/author/media", label: "Media Library", icon: ImageIcon },
  { href: "/author/profile", label: "Profile", icon: User },
  { href: "/author/settings", label: "Settings", icon: Settings },
];

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute requireRole="author">
      <div className="flex min-h-screen">
        <DashboardSidebar
          items={AUTHOR_NAV}
          brandLabel="Author Dashboard"
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
        <div className="flex-1">
          <DashboardTopbar title="Author Dashboard" onMenuClick={() => setMobileOpen(true)} />
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
