import { notFound } from "next/navigation";
import { requireDeveloper } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import type { ApiEnvelope, Role } from "@/lib/types";
import { RoleForm } from "../role-form";
import { updateRoleAction } from "../actions";

export const metadata = {
  title: "Modifier un rôle — Tontine",
};

export default async function EditRolePage(props: PageProps<"/roles/[id]">) {
  await requireDeveloper();
  const { id } = await props.params;

  let role: Role;
  try {
    const response = await apiFetch<ApiEnvelope<Role>>(`/roles/${id}`);
    role = response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const boundUpdate = updateRoleAction.bind(null, role.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{role.name}</h1>
      </div>

      <RoleForm
        defaultValues={{ name: role.name, level: role.level }}
        onSubmit={boundUpdate}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
