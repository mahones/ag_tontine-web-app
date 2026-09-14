import type { AuthUser } from "@/lib/types";

/**
 * Mirrors database/seeders/Rolespermissionsseeder.php in ag_tontine.
 * Lower level = more authority. Level 0 bypasses every permission check
 * server-side (see User::hasPermission()), so it must stay exact (===), not <=.
 */
export const ROLE_LEVEL = {
  DEVELOPPEUR: 0,
  SUPER_ADMIN: 1,
  CHEF_AGENCE: 2,
  GESTIONNAIRE_OU_CAISSIER: 3,
  AGENT: 4,
} as const;

export function isDeveloper(user: Pick<AuthUser, "role">): boolean {
  return user.role?.level === ROLE_LEVEL.DEVELOPPEUR;
}

export function isMicrofinanceOwner(user: Pick<AuthUser, "role">): boolean {
  return user.role?.level === ROLE_LEVEL.SUPER_ADMIN;
}

export function fullName(user: Pick<AuthUser, "first_name" | "last_name">): string {
  return `${user.first_name} ${user.last_name}`.trim();
}
