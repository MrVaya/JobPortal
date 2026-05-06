"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";

type Job = {
  id: string;
  title: string;
  location: string;
  jobType: string;
  createdAt?: string;
};

export default function MyJobsPage() {
  return (
    <ProtectedRoute allowedRoles={["EMPLOYER"]} redirectTo="/jobs">
      <MyJobsContent />
    </ProtectedRoute>
  );
}

function MyJobsContent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        setLoading(true);
        setMessage("");

        const res = await apiFetch(
          "/jobs/my-jobs?page=1&limit=10&sortBy=createdAt&sortOrder=desc",
          {
            method: "GET",
          }
        );

        const data = await res.json();

        if (data.success) {
          setJobs(data.data?.jobs || []);
        } else {
          setMessage(data.message || "Failed to load jobs.");
        }
      } catch {
        setMessage("Something went wrong while loading jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, []);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Jobs</h1>
          <p className="mt-1 text-gray-600">
            Manage your posted jobs and review applicants.
          </p>
        </div>

        <Link
          href="/create-job"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Post Job
        </Link>
      </div>

      {loading && <p>Loading jobs...</p>}

      {!loading && message && (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {message}
        </p>
      )}

      {!loading && !message && jobs.length === 0 && (
        <div className="rounded-lg border p-6 text-center">
          <p className="text-gray-600">You have not posted any jobs yet.</p>

          <Link
            href="/create-job"
            className="mt-4 inline-block rounded bg-black px-4 py-2 text-white"
          >
            Create your first job
          </Link>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-lg border p-4 shadow-sm">
              <h2 className="text-lg font-semibold">{job.title}</h2>
              <p className="text-gray-600">{job.location}</p>
              <p className="text-sm text-gray-500">{job.jobType}</p>

              <div className="mt-4 flex gap-3">
                <Link
                  href={`/jobs/${job.id}/applicants`}
                  className="rounded bg-black px-4 py-2 text-white"
                >
                  View Applicants
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}