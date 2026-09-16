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
import { TokenStore } from "@/lib/token-storage";
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
      autoLoadUser ? "loading" : "unauthenticated",
    );

  const router = useRouter();

  /* =========================================================
     LOAD CURRENT USER
  ========================================================= */

  const loadUser = useCallback(async () => {
    try {
      const me = await authApi.me();

      setUser(me as User);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  /* =========================================================
     INITIAL AUTH CHECK
  ========================================================= */

  useEffect(() => {
    if (autoLoadUser) {
      void loadUser();
    }

    const handleExpired = () => {
      TokenStore.clear();
      setUser(null);
      setStatus("unauthenticated");
    };

    window.addEventListener(
      "newshub:session-expired",
      handleExpired,
    );

    return () => {
      window.removeEventListener(
        "newshub:session-expired",
        handleExpired,
      );
    };
  }, [autoLoadUser, loadUser]);

  /* =========================================================
     LOGIN
  ========================================================= */

  const login = useCallback(
    async (email: string, password: string) => {
      /*
       * authApi.login expects TWO arguments:
       *
       * authApi.login(email, password)
       *
       * not:
       * authApi.login({ email, password })
       */
      const response = await authApi.login(
        email,
        password,
      );

      /* -------------------------------------------------------
         Store access token
      ------------------------------------------------------- */

      if (!response?.access) {
        throw new Error(
          "Login succeeded but no access token was returned.",
        );
      }

      TokenStore.setAccess(response.access);

      /* -------------------------------------------------------
         Get authenticated user
      ------------------------------------------------------- */

      let loggedInUser = response.user;

      if (!loggedInUser) {
        loggedInUser = await authApi.me();
      }

      if (!loggedInUser) {
        throw new Error(
          "Login succeeded but user information was not returned.",
        );
      }

      setUser(loggedInUser as User);
      setStatus("authenticated");
    },
    [],
  );

  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      TokenStore.clear();
      setUser(null);
      setStatus("unauthenticated");
      router.push("/");
    }
  }, [router]);

  /* =========================================================
     ROLE
  ========================================================= */

  const roleName = user?.role?.name;

  const value: AuthContextValue = {
    user,
    status,

    /*
     * Author access also applies to Admin and Super Admin.
     * Member & Contributor will use the same publishing flow
     * through the existing author/publishing access.
     */
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

/* =========================================================
   useAuth
========================================================= */

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider",
    );
  }

  return ctx;
}