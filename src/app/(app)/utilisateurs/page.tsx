import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { isDeveloper, isMicrofinanceOwner } from "@/lib/roles";
import { buttonVariants } from "@/components/ui/button";
import { buildListQuery, currentSearchValue } from "@/lib/list-query";
import type { ManagedUser, PaginatedEnvelope } from "@/lib/types";
import { UtilisateursTable } from "./utilisateurs-table";

export const metadata = {
  title: "Utilisateurs — Tontine",
};

/**
 * Reserved for Super Admin (own microfinance, via /microfinance/users), Chef Agence
 * (own agency, via /agency/users) and Gestionnaire (own agency, read-only, via
 * /agency/users too — view_agency_users). Super Admin/Chef Agence can edit
 * (name/phone/email/is_agent only) staff who outrank them numerically lower — the
 * table filters that per row, the backend enforces it regardless (and never returns
 * peers/superiors in the first place). Gestionnaire never gets create/edit here.
 *
 * Développeur has no flat, cross-microfinance users list of their own — they reach
 * staff by drilling into a microfinance's agencies instead (see /microfinances),
 * where "Nouvel utilisateur"/edit links still land on the pages below.
 */
export default async function UtilisateursPage(props: PageProps<"/utilisateurs">) {
  const user = await requireUser();
  if (isDeveloper(user)) redirect("/microfinances");
  const canManageUsers = hasPermission(user, "manage_users");
  const canViewUsers = hasPermission(user, "view_agency_users");
  if (!canManageUsers && !canViewUsers) redirect("/dashboard");

  const searchParams = await props.searchParams;
  const endpoint = isMicrofinanceOwner(user) ? "/microfinance/users" : "/agency/users";
  const { data: users, meta } = await apiFetch<PaginatedEnvelope<ManagedUser>>(
    `${endpoint}${buildListQuery(searchParams)}`,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">
            {isMicrofinanceOwner(user)
              ? "Comptes des agences de votre microfinance."
              : "Comptes de votre agence."}
          </p>
        </div>
        {canManageUsers && (
          <Link href="/utilisateurs/nouveau" className={buttonVariants()}>
            <PlusIcon />
            Nouvel utilisateur
          </Link>
        )}
      </div>

      <UtilisateursTable
        users={users}
        meta={meta}
        initialSearch={currentSearchValue(searchParams)}
        canManage={false}
        canEdit={canManageUsers}
        callerRoleLevel={user.role?.level ?? null}
      />
    </div>
  );
}
