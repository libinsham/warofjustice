"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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

const AuthContext =
  createContext<AuthContextValue | null>(null);

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
      autoLoadUser
        ? "loading"
        : "unauthenticated",
    );

  const router = useRouter();

  /*
   * ---------------------------------------------------------
   * AUTH OPERATION VERSION
   * ---------------------------------------------------------
   *
   * Prevents an older /auth/me() request from overwriting
   * a newer login or logout operation.
   */
  const authOperationRef = useRef(0);

  /* =========================================================
     LOAD CURRENT USER
  ========================================================= */

  const loadUser = useCallback(async () => {
    const operationId =
      ++authOperationRef.current;

    try {
      const me = await authApi.me();

      /*
       * Ignore this response when a newer auth operation
       * (login/logout/refresh) has already started.
       */
      if (
        operationId !==
        authOperationRef.current
      ) {
        return;
      }

      setUser(me as User);
      setStatus("authenticated");
    } catch {
      /*
       * Do not allow an old request to clear a newer
       * authenticated session.
       */
      if (
        operationId !==
        authOperationRef.current
      ) {
        return;
      }

      TokenStore.clear();
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
      /*
       * Invalidate all older auth operations.
       */
      ++authOperationRef.current;

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
  }, [
    autoLoadUser,
    loadUser,
  ]);

  /* =========================================================
     LOGIN
  ========================================================= */

  const login = useCallback(
    async (
      email: string,
      password: string,
    ) => {
      /*
       * This makes this login the newest auth operation.
       */
      const operationId =
        ++authOperationRef.current;

      const response =
        await authApi.login(
          email,
          password,
        );

      /* -------------------------------------------------------
         ACCESS TOKEN
      ------------------------------------------------------- */

      if (!response?.access) {
        throw new Error(
          "Login succeeded but no access token was returned.",
        );
      }

      TokenStore.setAccess(
        response.access,
      );

      /* -------------------------------------------------------
         CURRENT USER
      ------------------------------------------------------- */

      let loggedInUser =
        response.user;

      if (!loggedInUser) {
        loggedInUser =
          await authApi.me();
      }

      if (!loggedInUser) {
        TokenStore.clear();

        throw new Error(
          "Login succeeded but user information was not returned.",
        );
      }

      /*
       * Make sure this login is still the newest
       * authentication operation.
       */
      if (
        operationId !==
        authOperationRef.current
      ) {
        return;
      }

      /*
       * Update global auth state immediately.
       *
       * SiteHeader will re-render automatically.
       */
      setUser(
        loggedInUser as User,
      );

      setStatus(
        "authenticated",
      );
    },
    [],
  );

  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = useCallback(
    async () => {
      /*
       * Invalidate any older auth requests immediately.
       */
      ++authOperationRef.current;

      try {
        await authApi.logout();
      } catch {
        /*
         * Even if backend logout fails,
         * clear the browser session locally.
         */
      } finally {
        TokenStore.clear();

        setUser(null);

        setStatus(
          "unauthenticated",
        );

        router.push("/");
      }
    },
    [router],
  );

  /* =========================================================
     ROLE
  ========================================================= */

  const roleName =
    user?.role?.name;

  /*
   * Member & Contributor use the SAME publishing flow.
   *
   * Therefore all of these can access the Author/Publishing
   * dashboard:
   *
   * author
   * member
   * contributor
   * admin
   * super_admin
   */

  const isAuthor =
    roleName === "author" ||
    roleName === "member" ||
    roleName === "contributor" ||
    roleName === "admin" ||
    roleName === "super_admin";

  const isAdmin =
    roleName === "admin" ||
    roleName === "super_admin";

  const isSuperAdmin =
    roleName === "super_admin";

  /* =========================================================
     CONTEXT VALUE
  ========================================================= */

  const value: AuthContextValue = {
    user,
    status,

    isAuthor,

    isAdmin,

    isSuperAdmin,

    login,

    logout,

    refresh: loadUser,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================================================
   useAuth
========================================================= */

export function useAuth() {
  const ctx =
    useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider",
    );
  }

  return ctx;
}