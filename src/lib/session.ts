import "server-only";
import { cookies } from "next/headers";
import type { AuthUser } from "@/lib/types";

const COOKIE_NAME = "tontine_session";
// Matches Sanctum's token expiration (config/sanctum.php: 540 minutes) in ag_tontine.
const COOKIE_MAX_AGE = 60 * 60 * 9;

export type Session = {
  token: string;
  user: AuthUser;
};

export async function createSession(token: string, user: AuthUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify({ token, user }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
