"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { resendVerificationEmail } from "@/lib/auth";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      await resendVerificationEmail(email);

      setMessage("Verification email sent. Please check your inbox.");
      setEmail("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend verification email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Verify Your Email</h1>

        <p className="mt-2 text-sm text-gray-600">
          Your email is not verified. Enter your email to receive a new
          verification link.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="you@example.com"
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
            {loading ? "Sending..." : "Resend Verification Email"}
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