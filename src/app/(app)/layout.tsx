import Link from "next/link";
import { LogOutIcon, SettingsIcon, ShieldCheckIcon } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { fullName } from "@/lib/roles";
import { getNavItems } from "@/lib/nav";
import { AppSidebarNav } from "@/components/app-sidebar-nav";
import { logoutAction } from "@/lib/auth-actions";
import { buttonVariants, Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const navItems = getNavItems(user);
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="flex flex-col bg-sidebar-surface md:fixed md:inset-y-0 md:left-0 md:h-svh md:w-60">
        <div className="hidden items-center gap-2.5 border-b border-sidebar-border px-4 py-4 md:flex">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sidebar-surface-raised text-sidebar-accent-bar">
            <ShieldCheckIcon className="size-[18px]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user.role?.name ?? "Utilisateur"}</p>
            <p className="truncate text-xs text-sidebar-ink-muted">
              {user.agency?.name ?? "Toutes les microfinances"}
            </p>
          </div>
        </div>

        <div className="md:min-h-0 md:flex-1 md:overflow-y-auto md:py-3">
          <AppSidebarNav items={navItems} />
        </div>

        <div className="flex items-center gap-2.5 border-t border-sidebar-border px-3 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white">{fullName(user)}</p>
            {user.role && <p className="truncate text-xs text-sidebar-ink-muted">{user.role.name}</p>}
          </div>
          <form action={logoutAction}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon-sm"
                    className="text-sidebar-ink-muted hover:bg-sidebar-surface-raised hover:text-sidebar-ink-active"
                  />
                }
              >
                <LogOutIcon />
                <span className="sr-only">Déconnexion</span>
              </TooltipTrigger>
              <TooltipContent>Déconnexion</TooltipContent>
            </Tooltip>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:ml-60">
        <header className="flex h-12 shrink-0 items-center justify-end gap-3 border-b border-border bg-surface-raised px-4">
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href="/profil"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "icon-sm",
                    className: "text-muted-foreground hover:bg-primary-subtle hover:text-primary-subtle-foreground",
                  })}
                />
              }
            >
              <SettingsIcon />
              <span className="sr-only">Modifier mon profil</span>
            </TooltipTrigger>
            <TooltipContent>Mon profil</TooltipContent>
          </Tooltip>
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {initials}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
