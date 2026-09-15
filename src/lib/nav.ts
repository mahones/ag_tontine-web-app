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

  // manage_users: Super Admin (microfinance-wide) and Chef Agence (own agency); the
  // Développeur-only create/edit actions inside the page are hidden for everyone else.
  if (isDeveloper(user) || hasPermission(user, "manage_users")) {
    items.push({ href: "/utilisateurs", label: "Utilisateurs" });
  }

  if (hasPermission(user, "view_clients") && !isAgent(user)) {
    items.push({ href: "/clients", label: "Clients" });
  }

  if (isAgent(user)) {
    items.push({ href: "/agent/prospects", label: "Mes prospects" });
    items.push({ href: "/agent/clients", label: "Mes clients" });
  }

  return items;
}
