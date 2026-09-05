"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function DashboardSidebar({
  items,
  brandLabel,
  mobileOpen,
  onClose,
}: {
  items: SidebarItem[];
  brandLabel: string;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const content = (
    <div className="flex h-full flex-col bg-neutral-950 text-neutral-300">
      <div className="flex h-16 items-center border-b border-neutral-800 px-6">
        <Link href="/" className="text-lg font-black text-white">
          NEWS<span className="text-primary">HUB</span>
        </Link>
      </div>
      <p className="px-6 pt-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">{brandLabel}</p>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "hover:bg-neutral-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">{content}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-64">{content}</div>
        </div>
      )}
    </>
  );
}
