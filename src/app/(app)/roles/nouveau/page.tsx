import { requireDeveloper } from "@/lib/auth";
import { RoleForm } from "../role-form";
import { createRoleAction } from "../actions";

export const metadata = {
  title: "Nouveau rôle — Tontine",
};

export default async function NewRolePage() {
  await requireDeveloper();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouveau rôle</h1>
      </div>

      <RoleForm onSubmit={createRoleAction} submitLabel="Créer le rôle" />
    </div>
  );
}
