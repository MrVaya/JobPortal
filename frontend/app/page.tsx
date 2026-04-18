"use client";

import { useEffect, useState } from "react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs);
      });
  }, []);
  const [keyword, setKeyword] = useState("");

  const searchJobs = () => {
    fetch(`http://localhost:5000/api/jobs?keyword=${keyword}`)
      .then((res) => res.json())
      .then((data) => setJobs(data.jobs));
  };


  return (

    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Job Listings</h1>

      {jobs.map((job) => (
        <div key={job.id} className="border p-4 mb-3 rounded">
          <h2 className="text-lg font-semibold">{job.title}</h2>
          <p>{job.location}</p>
          <p className="text-sm text-gray-500">
            {job.company?.name}
          </p>
        </div>
      ))}
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search jobs..."
        className="border p-2 mr-2"
      />

      <button onClick={searchJobs} className="bg-blue-500 text-white px-4 py-2">
        Search
      </button>
    </div>


  );
}