import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { isDeveloper, isMicrofinanceOwner } from "@/lib/roles";
import type { ApiEnvelope, Agency, Role } from "@/lib/types";
import { UserForm } from "../user-form";
import { ManagedUserCreateForm } from "../managed-user-create-form";
import { MicrofinanceUserCreateForm } from "../microfinance-user-create-form";
import { createUserAction, createManagedUserAction, createMicrofinanceUserAction } from "../actions";

export const metadata = {
  title: "Nouvel utilisateur — Tontine",
};

/**
 * Développeur creates any user anywhere (role + agency pickers). Super Admin
 * registers staff anywhere in their own microfinance (role + agency-within-
 * microfinance pickers). Chef Agence registers staff for their own agency only
 * (no agency picker — forced server-side). There's no self-service sign-up page
 * in this app; account creation is always admin-driven.
 */
export default async function NewUserPage() {
  const caller = await requireUser();
  const dev = isDeveloper(caller);
  if (!dev && !hasPermission(caller, "manage_users")) redirect("/dashboard");

  if (dev) {
    const [{ data: agencies }, { data: roles }] = await Promise.all([
      apiFetch<ApiEnvelope<Agency[]>>("/agencies"),
      apiFetch<ApiEnvelope<Role[]>>("/roles"),
    ]);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nouvel utilisateur</h1>
        </div>

        <UserForm
          agencies={agencies}
          roles={roles}
          onSubmit={createUserAction}
          submitLabel="Créer l'utilisateur"
          passwordHint="8 caractères minimum."
        />
      </div>
    );
  }

  if (isMicrofinanceOwner(caller)) {
    const [{ data: agencies }, { data: roles }] = await Promise.all([
      apiFetch<ApiEnvelope<Agency[]>>("/microfinance/agencies"),
      apiFetch<ApiEnvelope<Role[]>>("/agency/roles"),
    ]);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nouvel utilisateur</h1>
          <p className="text-sm text-muted-foreground">
            Enregistrer un membre du personnel dans une agence de votre microfinance.
          </p>
        </div>

        <MicrofinanceUserCreateForm agencies={agencies} roles={roles} onSubmit={createMicrofinanceUserAction} />
      </div>
    );
  }

  const { data: roles } = await apiFetch<ApiEnvelope<Role[]>>("/agency/roles");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouvel utilisateur</h1>
        <p className="text-sm text-muted-foreground">Enregistrer un membre du personnel de votre agence.</p>
      </div>

      <ManagedUserCreateForm roles={roles} onSubmit={createManagedUserAction} />
    </div>
  );
}
