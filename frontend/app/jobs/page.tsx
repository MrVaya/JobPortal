"use client";

import { useEffect, useState } from "react";

type Job = {
    id: string;
    jobCode?: string;
    title: string;
    location: string;
    jobType: string;
    salaryMin?: number;
    salaryMax?: number;
    company?: {
        name: string;
    };
};

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [keyword, setKeyword] = useState("");
    const [location, setLocation] = useState("");
    const [jobType, setJobType] = useState("");

    const fetchJobs = async () => {
        const params = new URLSearchParams();

        if (keyword) params.append("keyword", keyword);
        if (location) params.append("location", location);
        if (jobType) params.append("jobType", jobType);

        const res = await fetch(`http://localhost:5000/api/jobs?${params.toString()}`);
        const data = await res.json();
        setJobs(data.jobs || []);
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-6">Job Listings</h1>

            <div className="grid gap-3 md:grid-cols-4 mb-6">
                <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search by keyword"
                    className="border rounded px-3 py-2"
                />

                <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Filter by location"
                    className="border rounded px-3 py-2"
                />

                <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="border rounded px-3 py-2"
                >
                    <option value="">All job types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Remote">Remote</option>
                </select>

                <button
                    onClick={fetchJobs}
                    className="rounded bg-black text-white px-4 py-2"
                >
                    Search
                </button>
            </div>

            <div className="space-y-4">
                {jobs.length === 0 ? (
                    <p>No jobs found.</p>
                ) : (
                    jobs.map((job) => (
                        <div key={job.id} className="border rounded p-4">
                            <h2 className="text-lg font-semibold">{job.title}</h2>
                            <p className="text-sm text-gray-600">
                                {job.company?.name} • {job.location}
                            </p>
                            <p className="text-sm mt-1">{job.jobType}</p>
                            <p className="text-sm mt-1">
                                Salary: {job.salaryMin ?? "-"} - {job.salaryMax ?? "-"}
                            </p>
                            <a
                                href={`/jobs/${job.id}`}
                                className="inline-block mt-3 text-blue-600"
                            >
                                View Details
                            </a>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}