"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    window.dispatchEvent(new Event("auth-changed"));

    router.push("/");
  };

  if (!mounted) return null;

  return (
    <nav className="border-b px-6 py-4 flex items-center justify-between">
      <div>
        <Link href="/" className="text-xl font-bold">
          Job Portal
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {!role && (
          <>
            <Link href="/register" className="text-sm">
              Register
            </Link>
            <Link href="/login" className="text-sm">
              Login
            </Link>
            <Link href="/jobs" className="text-sm">
              Jobs
            </Link>
          </>
        )}

        {role === "CANDIDATE" && (
          <>
            <Link href="/jobs" className="text-sm">
              Jobs
            </Link>
            <Link href="/my-applications" className="text-sm">
              My Applications
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm border px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}

        {role === "EMPLOYER" && (
          <>
            <Link href="/my-jobs" className="text-sm">
              My Jobs
            </Link>
            <Link href="/create-job" className="text-sm">
              Create Job
            </Link>
            <Link href="/jobs" className="text-sm">
              Jobs
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm border px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}