import type { AuthUser } from "@/lib/types";
import { isDeveloper, isMicrofinanceOwner } from "@/lib/roles";
import { hasPermission } from "@/lib/permissions";

export type NavItem = {
  href: string;
  label: string;
};

/**
 * Every role lands on "/dashboard". Additional entries are appended as their matching
 * module ships — Développeur (role level 0), Super Admin (role level 1), and the agency
 * operations space (Clients — Chef Agence/Gestionnaire/Caissier included) are built so far.
 */
export function getNavItems(user: AuthUser): NavItem[] {
  const items: NavItem[] = [{ href: "/dashboard", label: "Tableau de bord" }];

  if (isDeveloper(user)) {
    items.push({ href: "/microfinances", label: "Microfinances" });
    items.push({ href: "/roles", label: "Rôles" });
    items.push({ href: "/devises", label: "Devises" });
    items.push({ href: "/configurations", label: "Configurations" });
    items.push({ href: "/licences", label: "Licences" });
    items.push({ href: "/utilisateurs", label: "Utilisateurs" });
  }

  if (isMicrofinanceOwner(user)) {
    items.push({ href: "/agences", label: "Agences" });
    items.push({ href: "/prospects", label: "Prospects" });
  }

  if (hasPermission(user, "view_clients")) {
    items.push({ href: "/clients", label: "Clients" });
  }

  return items;
}
