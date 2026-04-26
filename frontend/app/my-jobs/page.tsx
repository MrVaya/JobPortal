"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api";

export default function CreateJobPage() {
  return (
    <ProtectedRoute allowedRoles={["EMPLOYER"]} redirectTo="/jobs">
      <CreateJobContent />
    </ProtectedRoute>
  );
}

function CreateJobContent() {
  const router = useRouter();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    jobType: "Full-time",
    salaryMin: "",
    salaryMax: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await apiFetch("/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          location: form.location,
          jobType: form.jobType,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Job created successfully.");

        setTimeout(() => {
          router.push("/my-jobs");
        }, 1000);
      } else {
        setMessage(data.message || "Failed to create job.");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Link href="/my-jobs" className="text-blue-600 text-sm">
          ← Back to My Jobs
        </Link>
      </div>

      <div className="rounded-lg border p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold">Create Job</h1>

        {user && (
          <p className="mb-4 text-sm text-gray-600">
            Creating job as {user.name}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Job title"
            className="w-full rounded border px-3 py-2"
            required
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Job description"
            className="h-32 w-full rounded border px-3 py-2"
            required
          />

          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full rounded border px-3 py-2"
            required
          />

          <select
            name="jobType"
            value={form.jobType}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Remote">Remote</option>
          </select>

          <input
            type="number"
            name="salaryMin"
            value={form.salaryMin}
            onChange={handleChange}
            placeholder="Minimum salary"
            className="w-full rounded border px-3 py-2"
          />

          <input
            type="number"
            name="salaryMax"
            value={form.salaryMax}
            onChange={handleChange}
            placeholder="Maximum salary"
            className="w-full rounded border px-3 py-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Job"}
          </button>

          {message && (
            <p className="text-sm text-gray-700">{message}</p>
          )}
        </form>
      </div>
    </main>
  );
}