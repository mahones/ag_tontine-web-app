import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ROLE_LEVEL, isAgent } from "@/lib/roles";
import { hasPermission, type PermissionCode } from "@/lib/permissions";
import type { AuthUser } from "@/lib/types";

/** Memoized per-request: cheap to call from layouts, pages, and leaf components alike. */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const session = await getSession();
  return session?.user ?? null;
});

/** Redirects to / (general login) when there is no session. Use at the top of protected pages/layouts. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

/**
 * Redirects to /dashboard when the user isn't a developer (role level 0). The backend's
 * `onlydev` middleware enforces the real boundary; this only avoids rendering
 * a page the API would reject anyway.
 */
export async function requireDeveloper(): Promise<AuthUser> {
  const user = await requireUser();
  if (user.role?.level !== ROLE_LEVEL.DEVELOPPEUR) redirect("/dashboard");
  return user;
}

/**
 * Redirects to /dashboard when the user isn't a Super Admin (role level 1). Checks the
 * exact level rather than "level <= 1": the backend endpoints this guards
 * (getAgenciesByMicrofinance, prospectByAgency) key off the caller's own agency_id, which
 * Développeur accounts never have — even though the Développeur bypass would let them
 * through the permission/microfinance_owner middleware, the request would crash server-side.
 */
export async function requireSuperAdmin(): Promise<AuthUser> {
  const user = await requireUser();
  if (user.role?.level !== ROLE_LEVEL.SUPER_ADMIN) redirect("/dashboard");
  return user;
}

/**
 * Redirects to /dashboard when the user isn't an Agent (role level 4, is_agent === true).
 * Guards the /agent/** pages, which preview the /mobile/* API surface on the web ahead of
 * the real mobile app.
 */
export async function requireAgent(): Promise<AuthUser> {
  const user = await requireUser();
  if (!isAgent(user)) redirect("/dashboard");
  return user;
}

/**
 * Redirects to /dashboard unless the user is a Super Admin or a Développeur. Guards
 * pages that are otherwise Super-Admin-only (own microfinance) but now also serve
 * Développeur with a platform-wide scope (see e.g. /agences, /prospects) — the page
 * itself picks the right endpoint based on which of the two the caller is.
 */
export async function requireSuperAdminOrDeveloper(): Promise<AuthUser> {
  const user = await requireUser();
  if (user.role?.level !== ROLE_LEVEL.SUPER_ADMIN && user.role?.level !== ROLE_LEVEL.DEVELOPPEUR) {
    redirect("/dashboard");
  }
  return user;
}

/**
 * Redirects to /dashboard when the user's role lacks the given permission code (per
 * lib/permissions.ts, mirroring the backend's seeded role/permission matrix). Use for
 * agency-operations pages shared across several roles with different permissions
 * (Super Admin, Chef Agence, Gestionnaire, Caissier) rather than gating by role/level.
 */
export async function requirePermission(code: PermissionCode): Promise<AuthUser> {
  const user = await requireUser();
  if (!hasPermission(user, code)) redirect("/dashboard");
  return user;
}
