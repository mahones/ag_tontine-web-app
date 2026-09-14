import "server-only";
import { getSession } from "@/lib/session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000/api";

/** Thrown for any non-2xx response; carries the Laravel validation error bag when present. */
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Set to false for unauthenticated endpoints (e.g. /auth/login). Defaults to true. */
  auth?: boolean;
};

/**
 * Server-only fetch wrapper for the ag_tontine API. Attaches the caller's Sanctum
 * bearer token from the httpOnly session cookie, so it must only be called from
 * Server Components, Server Actions, or Route Handlers.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = true, body, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");

  let finalBody: BodyInit | undefined;
  if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
    finalBody = JSON.stringify(body);
  }

  if (auth) {
    const session = await getSession();
    if (session?.token) {
      finalHeaders.set("Authorization", `Bearer ${session.token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
    cache: "no-store",
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? `Une erreur est survenue (${response.status}).`,
      response.status,
      payload?.errors,
    );
  }

  return payload as T;
}
