"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function CreateJobPage() {
   return (
    <ProtectedRoute allowedRoles={["EMPLOYER"]} redirectTo="/jobs">
      <CreateJobContent />
    </ProtectedRoute>
  );
}

function CreateJobContent() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Create Job</h1>
      <CreateJobForm />
    </main>
  );
}

function CreateJobForm() {
  const router = useRouter();
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const isEmployer = String(role).toUpperCase() === "EMPLOYER";

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

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isEmployer) {
      router.push("/jobs");
    }
  }, [isLoading, isAuthenticated, isEmployer, router]);

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

  if (isLoading) {
    return <main className="p-6">Checking access...</main>;
  }

  if (!isAuthenticated || !isEmployer) {
    return null;
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/my-jobs" className="text-blue-600 text-sm">
          ← Back to My Jobs
        </Link>
      </div>

      <div className="border rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Create Job</h1>

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
            className="w-full border rounded px-3 py-2"
            required
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Job description"
            className="w-full border rounded px-3 py-2 h-32"
            required
          />

          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border rounded px-3 py-2"
            required
          />

          <select
            name="jobType"
            value={form.jobType}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
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
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="number"
            name="salaryMax"
            value={form.salaryMax}
            onChange={handleChange}
            placeholder="Maximum salary"
            className="w-full border rounded px-3 py-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Job"}
          </button>

          {message && <p>{message}</p>}
        </form>
      </div>
    </main>
  );
}