"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading, role } = useAuth();
  const jobId = params.id as string;

  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (role !== "CANDIDATE") {
      router.push("/my-jobs");
      return;
    }
  }, [isLoading, isAuthenticated, role, router]);

  const handleApply = async () => {
    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("coverLetter", coverLetter);

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}/apply`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Application submitted successfully.");
        setCoverLetter("");
        setResumeFile(null);
      } else {
        setMessage(data.message || "Something went wrong.");
      }
    } catch (error) {
      setMessage("Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <main className="p-6">Checking access...</main>;
  }

  if (!isAuthenticated || role !== "CANDIDATE") {
    return null;
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">

      <div className="mb-6">
  <Link href={`/jobs/${jobId}`} className="text-blue-600 text-sm">
    ← Back to Job Details
  </Link>
</div>
      <div className="border rounded-lg p-6 shadow-sm">
        <div className="mb-6">
  <h1 className="text-2xl font-bold">Apply to Job</h1>
  <p className="text-gray-600 mt-1">
    Submit your application and resume for this opportunity.
  </p>
</div>

        <label className="block mb-2 font-medium">Cover Letter</label>
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Write your cover letter here..."
          className="w-full border rounded p-3 h-40"
        />

        <label className="block mt-4 mb-2 font-medium">Upload Resume</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setResumeFile(file);
          }}
          className="w-full border rounded p-2"
        />

        {resumeFile && (
          <p className="mt-2 text-sm text-gray-600">
            Selected file: {resumeFile.name}
          </p>
        )}

        <button
          onClick={handleApply}
          disabled={loading}
          className="mt-4 bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>

        {message && <p className="mt-4">{message}</p>}
      </div>
    </main>
  );
}