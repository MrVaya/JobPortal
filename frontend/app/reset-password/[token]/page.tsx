"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();

  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      await resetPassword(token, password);

      setMessage("Password updated successfully. Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid or expired reset token."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Reset Password</h1>

        <p className="mt-2 text-sm text-gray-600">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              New Password
            </label>

            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          {message && (
            <p className="rounded bg-green-50 p-3 text-sm text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p className="rounded bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          Back to login
        </Link>
      </section>
    </main>
  );
}