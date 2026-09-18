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
    <nav className="flex gap-1 overflow-x-auto p-2 md:flex-col md:gap-0.5 md:overflow-visible md:p-0 md:py-2">
      {items.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors md:w-full md:rounded-none md:px-4",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-[#F6BA93] hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
