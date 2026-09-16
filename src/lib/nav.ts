import type { AuthUser } from "@/lib/types";
import { isAgent, isDeveloper, isMicrofinanceOwner } from "@/lib/roles";
import { hasPermission } from "@/lib/permissions";

export type NavItem = {
  href: string;
  label: string;
};

/**
 * Every role lands on "/dashboard". Additional entries are appended as their matching
 * module ships — Développeur (role level 0), Super Admin (role level 1), the agency
 * operations space (Clients — Chef Agence/Gestionnaire/Caissier included), and the Agent
 * (level 4) mobile-route preview (/agent/**) are built so far.
 */
export function getNavItems(user: AuthUser): NavItem[] {
  const items: NavItem[] = [{ href: "/dashboard", label: "Tableau de bord" }];

  if (isDeveloper(user)) {
    items.push({ href: "/microfinances", label: "Microfinances" });
    items.push({ href: "/roles", label: "Rôles" });
    items.push({ href: "/devises", label: "Devises" });
    items.push({ href: "/configurations", label: "Configurations" });
    items.push({ href: "/licences", label: "Licences" });
  }

  if (isMicrofinanceOwner(user)) {
    items.push({ href: "/agences", label: "Agences" });
    items.push({ href: "/prospects", label: "Prospects" });
  }

  // manage_users: Super Admin (microfinance-wide, create/edit) and Chef Agence (own
  // agency, create/edit); view_agency_users: Gestionnaire (read-only, own agency).
  // Développeur has no direct users list — they reach staff by drilling down into a
  // microfinance's agencies instead (see /microfinances). Excluded explicitly here since
  // hasPermission() always returns true for a Développeur (level 0 bypasses every check).
  if (!isDeveloper(user) && (hasPermission(user, "manage_users") || hasPermission(user, "view_agency_users"))) {
    items.push({ href: "/utilisateurs", label: "Utilisateurs" });
  }

  // Développeur has no direct clients list either (same reasoning as Utilisateurs above):
  // they reach a microfinance's clients by drilling into its agencies instead, where the
  // existing client detail page (/clients/{id}) is still used to view one.
  if (!isDeveloper(user) && hasPermission(user, "view_clients") && !isAgent(user)) {
    items.push({ href: "/clients", label: "Clients" });
  }

  if (isAgent(user)) {
    items.push({ href: "/agent/prospects", label: "Mes prospects" });
    items.push({ href: "/agent/clients", label: "Mes clients" });
  }

  return items;
}
