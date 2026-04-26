import { logoutUser, refreshSession } from "@/lib/auth";

const API_URL = "http://localhost:5000/api";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  let res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (res.status !== 401) {
    return res;
  }

  const refreshed = await refreshSession();

  if (!refreshed) {
    await logoutUser();

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    throw new Error("Session expired. Please login again.");
  }

  res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    await logoutUser();

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    throw new Error("Session expired. Please login again.");
  }

  return res;
}