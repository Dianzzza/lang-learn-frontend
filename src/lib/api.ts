const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
  token?: string;
  user?: User;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown> | null,
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json().catch(() => ({}))) as T;

  if (!res.ok) {
    const msg =
      (data as { message?: string })?.message ||
      res.statusText ||
      "Błąd sieci";
    throw new Error(msg);
  }

  return data;
}
