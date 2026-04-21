import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">Job Portal</h1>

      <div className="space-x-4">
        <Link href="/register" className="text-blue-600">
          Register
        </Link>
        <Link href="/login" className="text-blue-600">
          Login
        </Link>
        <Link href="/jobs" className="text-blue-600">
          View Jobs
        </Link>
      </div>
    </main>
  );
}