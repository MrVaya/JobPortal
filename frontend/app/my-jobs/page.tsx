"use client";

import { useEffect, useState } from "react";

type Application = {
    id: string;
    status: string;
    appliedAt: string;
    job: {
        title: string;
        location: string;
        company?: {
            name: string;
        };
    };
};

export default function MyApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchApplications = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setMessage("No token found.");
                return;
            }

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
        };

        fetchApplications();
    }, []);

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">My Applications</h1>

            {message && <p>{message}</p>}

            <div className="space-y-4">
                {applications.map((application) => (
                    <div key={application.id} className="border rounded p-4">
                        <h2 className="font-semibold">{application.job.title}</h2>
                        <p>{application.job.company?.name}</p>
                        <p>{application.job.location}</p>
                        <p>Status: {application.status}</p>
                    </div>
                ))}
            </div>
        </main>
    );
}