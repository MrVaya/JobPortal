"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthUser, LoginPayload } from "@/types/auth";
import { getCurrentUser, loginUser, logoutUser } from "@/lib/auth";

type AuthContextType = {
  user: AuthUser | null;
  role: AuthUser["role"] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function checkSession() {
    try {
      setIsLoading(true);
      setError(null);

      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
      setError("Session expired. Please login again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { 
    checkSession();
  }, []);

  async function login(data: LoginPayload) {
    try {
      setIsLoading(true);
      setError(null);

      const loggedInUser = await loginUser(data);
      setUser(loggedInUser);
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      setIsLoading(true);
      setError(null);

      await logoutUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      isLoading,
      error,
      login,
      logout,
      checkSession,
    }),
    [user, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}