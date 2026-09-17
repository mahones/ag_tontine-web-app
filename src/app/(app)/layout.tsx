import Link from "next/link";
import Image from "next/image";
import { SettingsIcon } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { fullName } from "@/lib/roles";
import { getNavItems } from "@/lib/nav";
import { AppSidebarNav } from "@/components/app-sidebar-nav";
import { LogoutButton } from "@/components/logout-button";
import { buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const navItems = getNavItems(user);

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="flex flex-col border-b bg-[#FDF0E8] md:fixed md:inset-y-0 md:left-0 md:h-svh md:w-56 md:border-r md:border-b-0">
        <div className="hidden px-4 py-4 md:block">
          <Image src="/assets/e-tontine-logo-full.png" alt="E-Tontine" width={476} height={136} className="h-11 w-auto" priority />
        </div>
        <div className="md:min-h-0 md:flex-1 md:overflow-y-auto">
          <AppSidebarNav items={navItems} />
        </div>

        <div className="border-t px-4 py-3">
          <p className="truncate text-sm font-medium">{fullName(user)}</p>
          {user.role && <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.role.name}</p>}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:ml-56">
        <header className="flex items-center justify-end gap-3 border-b bg-background px-4 py-3">
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href="/profil"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "icon",
                    className: "bg-secondary text-white hover:bg-primary hover:text-white",
                  })}
                />
              }
            >
              <SettingsIcon />
              <span className="sr-only">Modifier mon profil</span>
            </TooltipTrigger>
            <TooltipContent>Mon profil</TooltipContent>
          </Tooltip>
          <LogoutButton />
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
