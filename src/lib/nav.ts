import type { AuthUser } from "@/lib/types";
import { isDeveloper } from "@/lib/roles";

export type NavItem = {
  href: string;
  label: string;
};

/**
 * Every role lands on "/". Additional entries are appended as their matching
 * module ships — for now only the Développeur (role level 0) space is built.
 */
export function getNavItems(user: AuthUser): NavItem[] {
  const items: NavItem[] = [{ href: "/", label: "Tableau de bord" }];

  if (isDeveloper(user)) {
    items.push({ href: "/microfinances", label: "Microfinances" });
  }

  return items;
}
