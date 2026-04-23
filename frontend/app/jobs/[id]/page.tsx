import Link from "next/link";

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
    description?: string;
    location?: string;
    website?: string;
  };
};

async function getJob(id: string): Promise<Job | null> {
  try {
    const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
      cache: "no-store",
    });

    const data = await res.json();

    if (!data.success) {
      return null;
    }

    return data.job;
  } catch (error) {
    return null;
  }
}

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="border rounded-xl p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold mb-3">Job not found</h1>
          <p className="text-gray-600 mb-6">
            The job you are looking for does not exist or may have been removed.
          </p>

          <Link
            href="/jobs"
            className="inline-block bg-black text-white px-4 py-2 rounded"
          >
            Back to Jobs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/jobs" className="text-blue-600 text-sm">
          ← Back to Jobs
        </Link>
      </div>

      <div className="border rounded-xl p-6 shadow-sm space-y-8">
        <section>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">{job.title}</h1>

            {job.jobCode && (
              <p className="text-sm text-gray-500">{job.jobCode}</p>
            )}

            <p className="text-lg">{job.company?.name}</p>
            <p className="text-gray-600">{job.location}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Job Type</p>
              <p className="font-medium">{job.jobType}</p>
            </div>

            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Salary</p>
              <p className="font-medium">
                {job.salaryMin ?? "-"} - {job.salaryMax ?? "-"}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Job Description</h2>
          <div className="border rounded-lg p-4">
            <p className="leading-7 text-gray-800">{job.description}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Company Details</h2>
          <div className="border rounded-lg p-4 space-y-2">
            <p>
              <span className="font-medium">Name:</span> {job.company?.name}
            </p>

            {job.company?.location && (
              <p>
                <span className="font-medium">Location:</span>{" "}
                {job.company.location}
              </p>
            )}

            {job.company?.website && (
              <p>
                <span className="font-medium">Website:</span>{" "}
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600"
                >
                  {job.company.website}
                </a>
              </p>
            )}

            {job.company?.description && (
              <p className="pt-2 text-gray-700">{job.company.description}</p>
            )}
          </div>
        </section>

        <section className="pt-2">
          <Link
            href={`/jobs/${job.id}/apply`}
            className="inline-block bg-black text-white px-5 py-3 rounded"
          >
            Apply Now
          </Link>
        </section>
      </div>
    </main>
  );
}