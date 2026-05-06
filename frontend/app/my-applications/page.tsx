"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";

type Application = {
  id: string;
  status: string;
  appliedAt: string;
  coverLetter?: string;
  job: {
    id: string;
    title: string;
    location: string;
    jobType: string;
    company?: {
      name: string;
    };
  };
};

export default function MyApplicationsPage() {
  return (
    <ProtectedRoute allowedRoles={["CANDIDATE"]} redirectTo="/jobs">
      <MyApplicationsContent />
    </ProtectedRoute>
  );
}

function MyApplicationsContent() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setMessage("");

        const res = await apiFetch("/jobs/my-applications", {
          method: "GET",
        });

        const data = await res.json();

        if (data.success) {
          setApplications(data.applications || []);
        } else {
          setMessage(data.message || "Failed to load applications.");
        }
      } catch {
        setMessage("Something went wrong while loading applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="mt-1 text-gray-600">
          Track the jobs you have applied to.
        </p>
      </div>

      {loading && <p>Loading applications...</p>}

      {!loading && message && (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {message}
        </p>
      )}

      {!loading && !message && applications.length === 0 && (
        <div className="rounded-lg border p-6 text-center text-gray-600">
          You have not applied to any jobs yet.
        </div>
      )}

      {!loading && applications.length > 0 && (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="rounded-lg border p-4 shadow-sm"
            >
              <h2 className="text-lg font-semibold">
                {application.job.title}
              </h2>

              <p className="text-gray-600">
                {application.job.company?.name || "Company not specified"} •{" "}
                {application.job.location}
              </p>

              <p className="mt-1">
                <span className="font-medium">Job Type:</span>{" "}
                {application.job.jobType}
              </p>

              <p className="mt-1">
                <span className="font-medium">Status:</span>{" "}
                {application.status}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Applied on:{" "}
                {new Date(application.appliedAt).toLocaleString()}
              </p>

              {application.coverLetter && (
                <p className="mt-2">
                  <span className="font-medium">Cover Letter:</span>{" "}
                  {application.coverLetter}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}