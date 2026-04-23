"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const updateAuthState = () => {
      const savedRole = localStorage.getItem("role");
      setRole(savedRole);
      setMounted(true);
    };

    updateAuthState();

    window.addEventListener("storage", updateAuthState);
    window.addEventListener("auth-changed", updateAuthState);

    return () => {
      window.removeEventListener("storage", updateAuthState);
      window.removeEventListener("auth-changed", updateAuthState);
    };
  }, []);

  if (!mounted) return null;

  return (
    <main className="max-w-4xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-4">Find your next opportunity</h1>

      <p className="text-gray-600 mb-8">
        Browse jobs, apply as a candidate, or post openings as an employer.
      </p>

      <div className="flex flex-wrap gap-4">
        {!role && (
          <>
            <Link
              href="/jobs"
              className="bg-black text-white px-4 py-2 rounded"
            >
              Browse Jobs
            </Link>

            <Link
              href="/register"
              className="border px-4 py-2 rounded"
            >
              Register
            </Link>

            <Link
              href="/login"
              className="border px-4 py-2 rounded"
            >
              Login
            </Link>
          </>
        )}

        {role === "CANDIDATE" && (
          <>
            <Link
              href="/jobs"
              className="bg-black text-white px-4 py-2 rounded"
            >
              Browse Jobs
            </Link>

            <Link
              href="/my-applications"
              className="border px-4 py-2 rounded"
            >
              My Applications
            </Link>
          </>
        )}

        {role === "EMPLOYER" && (
          <>
            <Link
              href="/my-jobs"
              className="bg-black text-white px-4 py-2 rounded"
            >
              My Jobs
            </Link>

            <Link
              href="/create-job"
              className="border px-4 py-2 rounded"
            >
              Create Job
            </Link>
          </>
        )}
      </div>
    </main>
  );
}