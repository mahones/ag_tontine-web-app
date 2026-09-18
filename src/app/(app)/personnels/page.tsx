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
import { PersonnelsTable } from "./personnels-table";

export const metadata = {
  title: "Personnel — Tontine",
};

/**
 * Serves Développeur (whole platform, via /users), Super Admin (own microfinance, via
 * /microfinance/users), Chef Agence (own agency, via /agency/users) and Gestionnaire
 * (own agency, read-only, via /agency/users too — view_agency_users). Développeur/Super
 * Admin/Chef Agence can edit (name/phone/email/is_agent only) staff who outrank them
 * numerically lower — the table filters that per row, the backend enforces it
 * regardless (and never returns peers/superiors in the first place). Gestionnaire never
 * gets create/edit here. "Nouvel utilisateur" already supports Développeur fully (role +
 * agency pickers — see /personnels/nouveau).
 */
export default async function PersonnelsPage(props: PageProps<"/personnels">) {
  const user = await requireUser();
  const canManageUsers = hasPermission(user, "manage_users");
  const canViewUsers = hasPermission(user, "view_agency_users");
  if (!canManageUsers && !canViewUsers) redirect("/dashboard");

  const searchParams = await props.searchParams;
  const dev = isDeveloper(user);
  const scopedToMicrofinance = isMicrofinanceOwner(user);
  const endpoint = dev ? "/users" : scopedToMicrofinance ? "/microfinance/users" : "/agency/users";
  const { data: users, meta } = await apiFetch<PaginatedEnvelope<ManagedUser>>(
    `${endpoint}${buildListQuery(searchParams)}`,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Personnel</h1>
          <p className="text-sm text-muted-foreground">
            {dev
              ? "Comptes de toute la plateforme."
              : scopedToMicrofinance
                ? "Comptes des agences de votre microfinance."
                : "Comptes de votre agence."}
          </p>
        </div>
        {canManageUsers && (
          <Link href="/personnels/nouveau" className={buttonVariants()}>
            <PlusIcon />
            Nouvel utilisateur
          </Link>
        )}
      </div>

      <PersonnelsTable
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
