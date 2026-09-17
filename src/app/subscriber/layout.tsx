"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  User,
  Settings,
} from "lucide-react";

import { AuthProvider } from "@/providers/auth-provider";
import { ProtectedRoute } from "@/components/shared/protected-route";
import {
  DashboardSidebar,
  type SidebarItem,
} from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

const SUBSCRIBER_NAV: SidebarItem[] = [
  {
    href: "/subscriber/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/subscriber/dashboard#emagazines",
    label: "e-Magazine",
    icon: BookOpen,
  },
  {
    href: "/subscriber/profile",
    label: "Profile",
    icon: User,
  },
  {
    href: "/subscriber/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function SubscriberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthProvider>
      <ProtectedRoute requireRole="subscriber">
        <div className="flex min-h-screen">
          <DashboardSidebar
            items={SUBSCRIBER_NAV}
            brandLabel="Subscriber Dashboard"
            mobileOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
          />

          <div className="flex-1">
            <DashboardTopbar
              title="Subscriber Dashboard"
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