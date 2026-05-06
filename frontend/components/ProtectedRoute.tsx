"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { UserRole } from "@/types/auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  requireVerifiedEmail?: boolean;
};

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
  requireVerifiedEmail = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, role, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (requireVerifiedEmail && user && !user.emailVerified) {
      router.replace("/resend-verification");
      return;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      router.replace(redirectTo);
    }
  }, [
    isLoading,
    isAuthenticated,
    role,
    user,
    allowedRoles,
    redirectTo,
    requireVerifiedEmail,
    router,
  ]);

  if (isLoading) {
    return <main className="p-6">Checking access...</main>;
  }

  if (!isAuthenticated) return null;

  if (requireVerifiedEmail && user && !user.emailVerified) return null;

  if (allowedRoles && role && !allowedRoles.includes(role)) return null;

  return <>{children}</>;
}