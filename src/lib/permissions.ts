import type { AuthUser } from "@/lib/types";

/**
 * Mirrors database/seeders/Rolespermissionsseeder.php in ag_tontine. Role *level* alone
 * isn't enough to gate UI: Gestionnaire and Caissier are both level 3 but have different
 * permissions. This is a frontend-only convenience for hiding buttons/nav a user can't use —
 * the backend's `permission:{code}` route middleware is the real enforcement.
 */
export type PermissionCode =
  | "see_all_agencies"
  | "view_global_reports"
  | "manage_users"
  | "view_agency_users"
  | "view_agency_reports"
  | "create_prospect"
  | "validate_prospect"
  | "create_client"
  | "create_notebook"
  | "view_clients"
  | "register_contribution_terrain"
  | "register_contribution_agence"
  | "submit_loan"
  | "approve_loan"
  | "see_loans"
  | "validate_withdrawal"
  | "view_withdrawals";

const ROLE_PERMISSIONS: Record<string, PermissionCode[]> = {
  "Super Admin": [
    "see_all_agencies",
    "view_global_reports",
    "manage_users",
    "view_agency_reports",
    "validate_prospect",
    "create_client",
    "create_notebook",
    "view_clients",
    "register_contribution_agence",
    "submit_loan",
    "approve_loan",
    "see_loans",
    "validate_withdrawal",
    "view_withdrawals",
  ],
  "Chef Agence": [
    "manage_users",
    "view_agency_reports",
    "validate_prospect",
    "create_client",
    "create_notebook",
    "view_clients",
    "register_contribution_agence",
    "submit_loan",
    "approve_loan",
    "see_loans",
    "validate_withdrawal",
    "view_withdrawals",
  ],
  Gestionnaire: [
    "validate_prospect",
    "create_client",
    "create_notebook",
    "view_clients",
    "submit_loan",
    "see_loans",
    "view_withdrawals",
    "view_agency_users",
  ],
  Caissier: ["view_clients", "register_contribution_agence", "see_loans", "validate_withdrawal", "view_withdrawals"],
  // Agent (level 4) is mobile-first, but its /mobile/* routes are previewed on the web
  // console for now (see /agent/**) ahead of the real mobile app being built.
  Agent: ["create_prospect", "register_contribution_terrain", "view_clients"],
};

/** Développeur (role level 0) bypasses every permission check, matching the backend. */
export function hasPermission(user: Pick<AuthUser, "role">, code: PermissionCode): boolean {
  if (user.role?.level === 0) return true;
  if (!user.role?.name) return false;
  return ROLE_PERMISSIONS[user.role.name]?.includes(code) ?? false;
}
