import type { AuthUser } from "@/lib/types";
import { isAgent, isDeveloper, isMicrofinanceOwner } from "@/lib/roles";
import { hasPermission } from "@/lib/permissions";

export type NavIcon =
  | "dashboard"
  | "microfinances"
  | "roles"
  | "devises"
  | "configurations"
  | "licences"
  | "agences"
  | "prospects"
  | "personnels"
  | "clients"
  | "prets"
  | "retraits"
  | "synchronisation";

export type NavItem = {
  href: string;
  label: string;
  icon: NavIcon;
};

/**
 * Every role lands on "/dashboard". Additional entries are appended as their matching
 * module ships — Développeur (role level 0), Super Admin (role level 1), the agency
 * operations space (Chef Agence/Gestionnaire/Caissier included), and the Agent (level 4)
 * mobile-route preview (/agent/**) are built so far.
 *
 * Agences/Prospects/Personnel/Clients/Prêts/Retraits follow the same three-tier scoping
 * throughout: Développeur sees the whole platform, Super Admin their own microfinance,
 * everyone else (Chef Agence/Gestionnaire/Caissier) their own agency — each page picks
 * the matching endpoint itself (see e.g. /prets/page.tsx, /retraits/page.tsx). Développeur
 * gets every one of these links (hasPermission() always returns true for them, level 0
 * bypasses every check), not just the platform-operator ones below.
 */
export function getNavItems(user: AuthUser): NavItem[] {
  const items: NavItem[] = [{ href: "/dashboard", label: "Tableau de bord", icon: "dashboard" }];

  if (isDeveloper(user)) {
    items.push({ href: "/microfinances", label: "Microfinances", icon: "microfinances" });
    items.push({ href: "/roles", label: "Rôles", icon: "roles" });
    items.push({ href: "/devises", label: "Devises", icon: "devises" });
    items.push({ href: "/configurations", label: "Configurations", icon: "configurations" });
    items.push({ href: "/licences", label: "Licences", icon: "licences" });
  }

  if (isDeveloper(user) || isMicrofinanceOwner(user)) {
    items.push({ href: "/agences", label: "Agences", icon: "agences" });
    items.push({ href: "/prospects", label: "Prospects", icon: "prospects" });
  }

  // manage_users: Super Admin (microfinance-wide, create/edit) and Chef Agence (own
  // agency, create/edit); view_agency_users: Gestionnaire (read-only, own agency).
  // Développeur gets the platform-wide list (/personnels/page.tsx branches on role).
  if (hasPermission(user, "manage_users") || hasPermission(user, "view_agency_users")) {
    items.push({ href: "/personnels", label: "Personnel", icon: "personnels" });
  }

  // Développeur gets the platform-wide list too (/clients/page.tsx branches on role).
  if (hasPermission(user, "view_clients") && !isAgent(user)) {
    items.push({ href: "/clients", label: "Clients", icon: "clients" });
  }

  // Développeur gets the platform-wide list too (/prets/page.tsx branches on role).
  if (hasPermission(user, "see_loans")) {
    items.push({ href: "/prets", label: "Prêts", icon: "prets" });
  }

  // Développeur gets the platform-wide list too (/retraits/page.tsx branches on role).
  if (hasPermission(user, "view_withdrawals")) {
    items.push({ href: "/retraits", label: "Retraits", icon: "retraits" });
  }

  if (isAgent(user)) {
    items.push({ href: "/agent/prospects", label: "Mes prospects", icon: "prospects" });
    items.push({ href: "/agent/clients", label: "Mes clients", icon: "clients" });
  }

  // Same audience as the dashboard's stats cards. The page itself detects whether it's
  // running against a cloud or a local instance (MOBILE.md §8, Phase 4 "vue locale
  // uniquement") — no need to hide the link based on that here.
  if (hasPermission(user, "view_agency_reports")) {
    items.push({ href: "/synchronisation", label: "Synchronisation", icon: "synchronisation" });
  }

  return items;
}
