"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2Icon,
  CoinsIcon,
  HandCoinsIcon,
  KeyRoundIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  RefreshCwIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  UserRoundIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavIcon, NavItem } from "@/lib/nav";

const ICONS: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutDashboardIcon,
  microfinances: LandmarkIcon,
  roles: ShieldCheckIcon,
  devises: CoinsIcon,
  configurations: SettingsIcon,
  licences: KeyRoundIcon,
  agences: Building2Icon,
  prospects: UserPlusIcon,
  personnels: UsersIcon,
  clients: UserRoundIcon,
  prets: HandCoinsIcon,
  synchronisation: RefreshCwIcon,
};

export function AppSidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto px-2 py-2 md:flex-col md:gap-0.5 md:overflow-visible md:px-2 md:py-0">
      {items.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex shrink-0 items-center gap-2.5 rounded-md py-2 pr-2.5 pl-3 text-sm transition-colors md:w-full",
              isActive
                ? "bg-sidebar-surface-raised font-medium text-sidebar-ink-active before:absolute before:top-1 before:bottom-1 before:left-0 before:w-[3px] before:rounded-full before:bg-sidebar-accent-bar"
                : "text-sidebar-ink hover:bg-sidebar-surface-raised hover:text-sidebar-ink-active",
            )}
          >
            <Icon className={cn("size-4 shrink-0", isActive ? "text-sidebar-accent-bar" : "text-sidebar-ink-muted")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
