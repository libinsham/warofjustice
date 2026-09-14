import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/providers/auth-provider";

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
        <AuthProvider autoLoadUser={false}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}