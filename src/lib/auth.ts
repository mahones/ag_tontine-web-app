import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ROLE_LEVEL } from "@/lib/roles";
import type { AuthUser } from "@/lib/types";

/** Memoized per-request: cheap to call from layouts, pages, and leaf components alike. */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const session = await getSession();
  return session?.user ?? null;
});

/** Redirects to /login when there is no session. Use at the top of protected pages/layouts. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Redirects to / when the user isn't a developer (role level 0). The backend's
 * `onlydev` middleware enforces the real boundary; this only avoids rendering
 * a page the API would reject anyway.
 */
export async function requireDeveloper(): Promise<AuthUser> {
  const user = await requireUser();
  if (user.role?.level !== ROLE_LEVEL.DEVELOPPEUR) redirect("/");
  return user;
}
