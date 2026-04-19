"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
    const jobId = params.id as string;

    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchApplicants = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setMessage("No token found.");
                return;
            }

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
        };

        fetchApplicants();
    }, [jobId]);

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">Applicants</h1>

            {message && <p>{message}</p>}

            <div className="space-y-4">
                {applicants.map((applicant) => (
                    <div key={applicant.id} className="border rounded p-4">
                        <h2 className="font-semibold">{applicant.candidate.name}</h2>
                        <p>{applicant.candidate.email}</p>
                        <p>{applicant.coverLetter}</p>
                    </div>
                ))}
            </div>
        </main>
    );
}