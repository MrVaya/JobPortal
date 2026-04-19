type Job = {
    id: string;
    jobCode?: string;
    title: string;
    description: string;
    location: string;
    jobType: string;
    salaryMin?: number;
    salaryMax?: number;
    company?: {
        name: string;
        location?: string;
        website?: string;
        description?: string;
    };
};

async function getJob(id: string): Promise<Job | null> {
    const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        cache: "no-store",
    });

    const data = await res.json();
    return data.job || null;
}

export default async function JobDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const job = await getJob(id);

    if (!job) {
        return <main className="p-6">Job not found.</main>;
    }

    return (
        <main className="p-6 max-w-3xl">
            <h1 className="text-3xl font-bold">{job.title}</h1>

            <p className="mt-2 text-gray-600">
                {job.company?.name} • {job.location}
            </p>

            <p className="mt-2">
                {job.jobType} • Salary: {job.salaryMin ?? "-"} - {job.salaryMax ?? "-"}
            </p>

            <section className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Job Description</h2>
                <p>{job.description}</p>
            </section>

            <section className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Company</h2>
                <p>{job.company?.name}</p>
                <p>{job.company?.description}</p>
            </section>

            <div className="mt-8">
                <a
                    href={`/jobs/${job.id}/apply`}
                    className="rounded bg-black text-white px-4 py-2 inline-block"
                >
                    Apply Now
                </a>
            </div>
        </main>
    );
}