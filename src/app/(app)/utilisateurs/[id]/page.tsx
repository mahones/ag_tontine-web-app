import { notFound } from "next/navigation";
import { requireDeveloper } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import { fullName } from "@/lib/roles";
import type { ApiEnvelope, Agency, ManagedUser, Role } from "@/lib/types";
import { UserForm } from "../user-form";
import { updateUserAction } from "../actions";

export const metadata = {
  title: "Modifier un utilisateur — Tontine",
};

export default async function EditUserPage(props: PageProps<"/utilisateurs/[id]">) {
  await requireDeveloper();
  const { id } = await props.params;

  let user: ManagedUser;
  try {
    const response = await apiFetch<ApiEnvelope<ManagedUser>>(`/users/${id}`);
    user = response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const [{ data: agencies }, { data: roles }] = await Promise.all([
    apiFetch<ApiEnvelope<Agency[]>>("/agencies"),
    apiFetch<ApiEnvelope<Role[]>>("/roles"),
  ]);

  const boundUpdate = updateUserAction.bind(null, user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{fullName(user)}</h1>
      </div>

      <UserForm
        agencies={agencies}
        roles={roles}
        defaultValues={{
          agency_id: user.agency_id ?? "",
          role_id: user.role_id ?? "",
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          email: user.email,
          password: "",
          is_agent: user.is_agent,
        }}
        onSubmit={boundUpdate}
        submitLabel="Enregistrer les modifications"
        passwordHint="Laisser vide pour conserver le mot de passe actuel."
      />
    </div>
  );
}
