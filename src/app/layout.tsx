import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site-config";

// NOTE: this sandbox can't reach fonts.googleapis.com, so we use the
// system font stack here. In a real deployment, swap back to next/font's
// Geist/Geist_Mono (see git history / commented block below) — it works
// fine once the machine building/deploying has normal internet access.
//
// import { Geist, Geist_Mono } from "next/font/google";
// const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
// const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `Breaking news, in-depth analysis, videos, and photo galleries from ${SITE_NAME}.`,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
