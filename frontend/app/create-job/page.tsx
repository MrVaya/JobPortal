"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateJobPage() {
  const router = useRouter();

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

  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/login");
      return;
    }

    if (role !== "EMPLOYER") {
      router.push("/jobs");
      return;
    }

    setAuthorized(true);
    setCheckingAuth(false);
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("No token found. Please log in.");
        return;
      }

      const res = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    } catch (error) {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return <main className="p-6">Checking access...</main>;
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="border rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Create Job</h1>

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