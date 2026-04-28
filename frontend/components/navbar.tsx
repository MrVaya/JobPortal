"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const { user, role, isAuthenticated, logout, isLoading } = useAuth();

  return (
    <nav className="border-b bg-white px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          JobPortal
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/jobs" className="text-sm hover:text-blue-600">
            Jobs
          </Link>

          {isLoading ? (
            <span className="text-sm text-gray-500">Loading...</span>
          ) : isAuthenticated && user ? (
            <>
              {role === "EMPLOYER" && (
                <>
                  <Link href="/create-job" className="text-sm hover:text-blue-600">
                    Post Job
                  </Link>

                  <Link href="/my-jobs" className="text-sm hover:text-blue-600">
                    My Jobs
                  </Link>
                </>
              )}

              {role === "CANDIDATE" && (
                <Link
                  href="/my-applications"
                  className="text-sm hover:text-blue-600"
                >
                  My Applications
                </Link>
              )}

              <span className="text-sm text-gray-600">{user.name}</span>

              <button
                onClick={logout}
                className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:text-blue-600">
                Login
              </Link>

              <Link
                href="/register"
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}