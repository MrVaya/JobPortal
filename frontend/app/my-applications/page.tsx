"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/login");
      return;
    }

    if (role !== "CANDIDATE") {
      router.push("/my-jobs");
      return;
    }

    setAuthorized(true);
    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (!authorized) return;

    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/jobs/my-applications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setApplications(data.applications || []);
        } else {
          setMessage(data.message || "Failed to load applications.");
        }
      } catch (error) {
        setMessage("Something went wrong while loading applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [authorized]);

  if (checkingAuth) {
    return <main className="p-6">Checking access...</main>;
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">

      <div className="mb-6">
  <h1 className="text-2xl font-bold">My Applications</h1>
  <p className="text-gray-600 mt-1">
    Track the jobs you have applied to.
  </p>
</div>
      

      {loading && <p>Loading...</p>}
      {!loading && message && <p>{message}</p>}

      {!loading && !message && applications.length === 0 && (
        <p>You have not applied to any jobs yet.</p>
      )}

      <div className="space-y-4">
        {applications.map((application) => (
          <div key={application.id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold">{application.job.title}</h2>
            <p className="text-gray-600">
              {application.job.company?.name} • {application.job.location}
            </p>
            <p className="mt-1">
              <span className="font-medium">Job Type:</span> {application.job.jobType}
            </p>
            <p className="mt-1">
              <span className="font-medium">Status:</span> {application.status}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Applied on: {new Date(application.appliedAt).toLocaleString()}
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
    </main>
  );
}