import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      <QueryProvider>
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          {/* Website Header */}
          <SiteHeader />

          {/* Public Page Content */}
          <main className="flex-1">{children}</main>

          {/* Website Footer */}
          <SiteFooter />
        </div>
      </QueryProvider>
    </ThemeProvider>
  );
}