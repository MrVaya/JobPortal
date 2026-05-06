"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";

type ApplicationStatus = "PENDING" | "REVIEWED" | "SHORTLISTED" | "REJECTED";

type Applicant = {
  id: string;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  resumeFileType?: string;
  candidate: {
    name: string;
    email: string;
  };
};

export default function ApplicantsPage() {
  return (
    <ProtectedRoute allowedRoles={["EMPLOYER"]} redirectTo="/jobs">
      <ApplicantsContent />
    </ProtectedRoute>
  );
}

function ApplicantsContent() {
  const params = useParams();
  const jobId = params.id as string;

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        setMessage("");

        const res = await fetch(
          `http://localhost:5000/api/jobs/${jobId}/applicants`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();

        if (data.success) {
          setApplicants(data.data?.applicants || []);
        } else {
          setMessage(data.message || "Failed to load applicants.");
        }
      } catch {
        setMessage("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchApplicants();
    }
  }, [jobId]);

  const handleResumeAccess = async (
    applicationId: string,
    action: "view" | "download"
  ) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/jobs/${jobId}/applications/${applicationId}/resume`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to access resume.");
        return;
      }

      const resumeUrl = data.data?.url;

      if (!resumeUrl) {
        alert("Resume URL not found.");
        return;
      }

      if (action === "view") {
        window.open(resumeUrl, "_blank", "noopener,noreferrer");
      }

      if (action === "download") {
        const link = document.createElement("a");
        link.href = resumeUrl;
        link.download = data.data?.fileName || "resume";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch {
      alert("Failed to access resume.");
    }
  };

  const handleStatusChange = async (
    applicationId: string,
    status: ApplicationStatus
  ) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/jobs/${jobId}/applications/${applicationId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to update status.");
        return;
      }

      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant.id === applicationId
            ? { ...applicant, status }
            : applicant
        )
      );
    } catch {
      alert("Something went wrong while updating status.");
    }
  };

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <Link href="/my-jobs" className="text-sm text-blue-600">
          ← Back to My Jobs
        </Link>

        <h1 className="mt-4 text-2xl font-bold">Applicants</h1>
        <p className="mt-1 text-gray-600">
          Review candidates who applied for this job.
        </p>
      </div>

      {loading && <p>Loading applicants...</p>}

      {!loading && message && (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {message}
        </p>
      )}

      {!loading && !message && applicants.length === 0 && (
        <div className="rounded-lg border p-6 text-center text-gray-600">
          No applicants found for this job.
        </div>
      )}

      {!loading && applicants.length > 0 && (
        <div className="space-y-4">
          {applicants.map((applicant) => (
            <div key={applicant.id} className="rounded-lg border p-4 shadow-sm">
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <h2 className="font-semibold">{applicant.candidate.name}</h2>
                  <p className="text-gray-600">{applicant.candidate.email}</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Status
                  </label>

                  <select
                    value={applicant.status}
                    onChange={(e) =>
                      handleStatusChange(
                        applicant.id,
                        e.target.value as ApplicationStatus
                      )
                    }
                    className="rounded border px-3 py-2"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {applicant.coverLetter && (
                <p className="mt-3">
                  <span className="font-medium">Cover Letter:</span>{" "}
                  {applicant.coverLetter}
                </p>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleResumeAccess(applicant.id, "view")}
                  className="rounded bg-black px-4 py-2 text-white"
                >
                  View Resume
                </button>

                <button
                  onClick={() => handleResumeAccess(applicant.id, "download")}
                  className="rounded border px-4 py-2"
                >
                  Download Resume
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}