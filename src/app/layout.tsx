import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";

export const metadata: Metadata = {
  title: "WAR OF JUSTICE",
  description: "Fearless Journalism",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <AuthProvider autoLoadUser={true}>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}