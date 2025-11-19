// src/lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface ApiError {
  message?: string;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function apiRequest<T = unknown>(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: Record<string, unknown> | null,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "omit",
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      (typeof data === "object" && data && "message" in data
        ? (data as Record<string, unknown>).message
        : res.statusText) || "Błąd sieci";
    throw new Error(String(msg));
  }

  return data as T;
}
