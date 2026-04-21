"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Applicant = {
  id: string;
  coverLetter?: string;
  candidate: {
    name: string;
    email: string;
  };
};

export default function ApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [applicants, setApplicants] = useState<Applicant[]>([]);
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

    const fetchApplicants = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:5000/api/jobs/${jobId}/applicants`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (data.success) {
          setApplicants(data.applicants || []);
        } else {
          setMessage(data.message || "Failed to load applicants.");
        }
      } catch (error) {
        setMessage("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [authorized, jobId]);

  if (checkingAuth) {
    return <main className="p-6">Checking access...</main>;
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Applicants</h1>

      {loading && <p>Loading...</p>}
      {!loading && message && <p>{message}</p>}

      <div className="space-y-4">
        {applicants.map((applicant) => (
          <div key={applicant.id} className="border rounded-lg p-4">
            <h2 className="font-semibold">{applicant.candidate.name}</h2>
            <p>{applicant.candidate.email}</p>

            {applicant.coverLetter && (
              <p className="mt-2">
                <span className="font-medium">Cover Letter:</span>{" "}
                {applicant.coverLetter}
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}