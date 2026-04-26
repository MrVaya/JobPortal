import { AuthUser, LoginPayload } from "@/types/auth";

export async function loginUser(data: LoginPayload): Promise<AuthUser> {
  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(result.message || "Login failed");
  }

  return result.user;
}