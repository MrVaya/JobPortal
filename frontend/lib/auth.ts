import { AuthUser, LoginPayload } from "@/types/auth";

const API_URL = "http://localhost:5000/api";

export async function loginUser(data: LoginPayload): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/login`, {
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

  return result.data.user;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) return null;

  const result = await res.json();

  return result.data.user;
}

export async function refreshSession(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    return res.ok;
  } catch {
    return false;
  }
}

export async function logoutUser(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to send reset link");
  }

  return data;
}

export async function resetPassword(
  token: string,
  password: string
) {
  const res = await fetch(
    `${API_URL}/auth/reset-password/${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    }
  );

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to reset password");
  }

  return data;
  
}
export async function verifyEmail(token: string) {
  const res = await fetch(`${API_URL}/auth/verify-email/${token}`, {
    method: "POST",
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Invalid or expired verification token");
  }

  return data;
}

export async function resendVerificationEmail(email: string) {
  const res = await fetch(`${API_URL}/auth/resend-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to send verification email");
  }

  return data;
}