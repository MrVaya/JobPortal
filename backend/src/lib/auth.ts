const API_URL = "http://localhost:5000/api";

export async function loginUser(data: LoginPayload) {
  try {
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
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    throw new Error(
      "Unable to connect to server. Please check backend."
    );
  }
}