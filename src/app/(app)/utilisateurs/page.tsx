import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { isDeveloper, isMicrofinanceOwner } from "@/lib/roles";
import { buttonVariants } from "@/components/ui/button";
import type { ApiEnvelope, ManagedUser } from "@/lib/types";
import { UtilisateursTable } from "./utilisateurs-table";

export const metadata = {
  title: "Utilisateurs — Tontine",
};

/**
 * Reserved for Développeur (all users), Super Admin (own microfinance, via
 * /microfinance/users) and Chef Agence (own agency, via /agency/users) — the three roles
 * carrying the manage_users permission. Développeur gets create/edit/toggle/delete on
 * anyone; Super Admin/Chef Agence can edit (name/phone/email/is_agent only) staff who
 * outrank them numerically lower — the table filters that per row, the backend enforces
 * it regardless. Toggle/delete stay dev-only server-side (see actions.ts).
 */
export default async function UtilisateursPage() {
  const user = await requireUser();
  const dev = isDeveloper(user);
  if (!dev && !hasPermission(user, "manage_users")) redirect("/dashboard");

  const endpoint = dev ? "/users" : isMicrofinanceOwner(user) ? "/microfinance/users" : "/agency/users";
  const { data: users } = await apiFetch<ApiEnvelope<ManagedUser[]>>(endpoint);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">
            {dev
              ? "Comptes de la plateforme, tous rôles et agences confondus."
              : isMicrofinanceOwner(user)
                ? "Comptes des agences de votre microfinance."
                : "Comptes de votre agence."}
          </p>
        </div>
        {(dev || hasPermission(user, "manage_users")) && (
          <Link href="/utilisateurs/nouveau" className={buttonVariants()}>
            <PlusIcon />
            Nouvel utilisateur
          </Link>
        )}
      </div>

      <UtilisateursTable users={users} canManage={dev} canEdit={dev || hasPermission(user, "manage_users")} callerRoleLevel={user.role?.level ?? null} />
    </div>
  );
}
