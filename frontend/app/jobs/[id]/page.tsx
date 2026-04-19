"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function ApplyPage() {
    const params = useParams();
    const jobId = params.id as string;

    const [coverLetter, setCoverLetter] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        try {
            setLoading(true);
            setMessage("");

            const token = localStorage.getItem("token");

            if (!token) {
                setMessage("No token found. Please log in first.");
                return;
            }

            const res = await fetch(`http://localhost:5000/api/jobs/${jobId}/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    coverLetter,
                    resumeUrl: "resume.pdf",
                    resumeFileName: "resume.pdf",
                    resumeFileType: "application/pdf",
                }),
            });

            const data = await res.json();

            if (data.success) {
                setMessage("Application submitted successfully.");
                setCoverLetter("");
            } else {
                setMessage(data.message || "Something went wrong.");
            }
        } catch (error) {
            setMessage("Failed to submit application.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="p-6 max-w-2xl mx-auto">
            <div className="border rounded-lg p-6 shadow-sm">
                <h1 className="text-2xl font-bold mb-4">Apply to Job</h1>

                <label className="block mb-2 font-medium">Cover Letter</label>
                <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Write your cover letter here..."
                    className="w-full border rounded p-3 h-40"
                />

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