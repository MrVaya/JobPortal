"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.user.role);
window.dispatchEvent(new Event("auth-changed"));

                setMessage("Login successful.");

                if (data.user.role === "EMPLOYER") {
                    router.push("/my-jobs");
                } else {
                    router.push("/jobs");
                }
            } else {
                setMessage(data.message || "Login failed.");
            }
        } catch (error) {
            setMessage("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");

  window.dispatchEvent(new Event("auth-changed"));

  router.push("/");
};

    return (
        <main className="p-6 max-w-md mx-auto">
            <div className="border rounded-lg p-6 shadow-sm">
                <h1 className="text-2xl font-bold mb-4">Login</h1>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {message && <p className="mt-4 text-sm">{message}</p>}
            </div>
        </main>
    );
}