import { requireUser } from "@/lib/auth";
import { fullName } from "@/lib/roles";
import { getNavItems } from "@/lib/nav";
import { AppSidebarNav } from "@/components/app-sidebar-nav";
import { LogoutButton } from "@/components/logout-button";
import { Badge } from "@/components/ui/badge";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const navItems = getNavItems(user);

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="border-b bg-muted/30 md:w-56 md:shrink-0 md:border-r md:border-b-0">
        <div className="hidden px-4 py-4 md:block">
          <span className="text-lg font-semibold tracking-tight">Tontine</span>
        </div>
        <AppSidebarNav items={navItems} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b bg-background px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{fullName(user)}</p>
            {user.role && (
              <Badge variant="secondary" className="mt-0.5">
                {user.role.name}
              </Badge>
            )}
          </div>
          <LogoutButton />
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
