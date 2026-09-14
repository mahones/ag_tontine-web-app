import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ROLE_LEVEL } from "@/lib/roles";
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
