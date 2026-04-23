"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Job = {
  id: string;
  title: string;
  location: string;
  jobType: string;
};

export default function MyJobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
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

    if (role !== "EMPLOYER") {
      router.push("/jobs");
      return;
    }

    setAuthorized(true);
    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (!authorized) return;

    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/jobs/my-jobs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setJobs(data.jobs || []);
        } else {
          setMessage(data.message || "Failed to load jobs.");
        }
      } catch (error) {
        setMessage("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [authorized]);

  if (checkingAuth) {
    return <main className="p-6">Checking access...</main>;
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
   <div className="mb-6 flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold">My Jobs</h1>
    <p className="text-gray-600 mt-1">
      Manage the jobs you have posted.
    </p>
  </div>

  <Link
    href="/create-job"
    className="bg-black text-white px-4 py-2 rounded"
  >
    Create Job
  </Link>
</div>

      {loading && <p>Loading...</p>}
      {!loading && message && <p>{message}</p>}

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="border rounded-lg p-4">
            <h2 className="font-semibold text-lg">{job.title}</h2>
            <p className="text-gray-600">{job.location}</p>
            <p>{job.jobType}</p>

            <Link
              href={`/jobs/${job.id}/applicants`}
              className="inline-block mt-3 text-blue-600"
            >
              View Applicants
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}