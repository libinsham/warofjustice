"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/lib/api/auth";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isAuthor: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const router = useRouter();

  const loadUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    loadUser();

    // Fired by the API client when a refresh attempt fails (see lib/api/client.ts).
    const handleExpired = () => {
      setUser(null);
      setStatus("unauthenticated");
      router.push("/login");
    };
    window.addEventListener("newshub:session-expired", handleExpired);
    return () => window.removeEventListener("newshub:session-expired", handleExpired);
  }, [loadUser, router]);

  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await authApi.login({ email, password });
    setUser(loggedInUser);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setStatus("unauthenticated");
    router.push("/");
  }, [router]);

  const value: AuthContextValue = {
    user,
    status,
    isAuthor: user?.role.name === "author" || user?.role.name === "admin" || user?.role.name === "super_admin",
    isAdmin: user?.role.name === "admin" || user?.role.name === "super_admin",
    isSuperAdmin: user?.role.name === "super_admin",
    login,
    logout,
    refresh: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
