import { requireDeveloper } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { ApiEnvelope, Agency, Role } from "@/lib/types";
import { UserForm } from "../user-form";
import { createUserAction } from "../actions";

export const metadata = {
  title: "Nouvel utilisateur — Tontine",
};

export default async function NewUserPage() {
  await requireDeveloper();

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
