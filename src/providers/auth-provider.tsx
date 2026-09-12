"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
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

export function AuthProvider({
  children,
  autoLoadUser = false,
}: {
  children: React.ReactNode;
  autoLoadUser?: boolean;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [status, setStatus] =
    useState<AuthContextValue["status"]>(
      autoLoadUser ? "loading" : "unauthenticated"
    );

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
    // Only load the user automatically when enabled
    if (autoLoadUser) {
      loadUser();
    }

    const handleExpired = () => {
      setUser(null);
      setStatus("unauthenticated");
    };

    window.addEventListener(
      "newshub:session-expired",
      handleExpired
    );

    return () => {
      window.removeEventListener(
        "newshub:session-expired",
        handleExpired
      );
    };
  }, [autoLoadUser, loadUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const loggedInUser = await authApi.login({
        email,
        password,
      });

      setUser(loggedInUser);
      setStatus("authenticated");
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setStatus("unauthenticated");
      router.push("/");
    }
  }, [router]);

  const roleName = user?.role?.name;

  const value: AuthContextValue = {
    user,
    status,

    isAuthor:
      roleName === "author" ||
      roleName === "admin" ||
      roleName === "super_admin",

    isAdmin:
      roleName === "admin" ||
      roleName === "super_admin",

    isSuperAdmin:
      roleName === "super_admin",

    login,
    logout,
    refresh: loadUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}