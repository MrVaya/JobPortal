"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { verifyEmail } from "@/lib/auth";

export default function VerifyEmailPage() {
  const params = useParams();
  const token = params.token as string;

  const [message, setMessage] = useState("Verifying your email...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleVerify() {
      try {
        await verifyEmail(token);
        setMessage("Email verified successfully. You can now login.");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Invalid or expired verification token."
        );
      }
    }

    handleVerify();
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow">
        <h1 className="text-2xl font-bold">Email Verification</h1>

        {error ? (
          <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : (
          <p className="mt-4 rounded bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}

        <Link
          href="/login"
          className="mt-5 inline-block rounded bg-black px-4 py-2 text-white"
        >
          Go to Login
        </Link>
      </section>
    </main>
  );
}