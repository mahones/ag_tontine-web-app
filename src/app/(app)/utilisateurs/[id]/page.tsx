import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { fullName, isDeveloper, isMicrofinanceOwner } from "@/lib/roles";
import type { ApiEnvelope, Agency, ManagedUser, Role } from "@/lib/types";
import { UserForm } from "../user-form";
import { ManagedUserForm } from "../managed-user-form";
import { updateUserAction, updateManagedUserAction } from "../actions";

export const metadata = {
  title: "Modifier un utilisateur — Tontine",
};

/**
 * Développeur edits any user with the full form (role, agency, password, active status).
 * Super Admin / Chef Agence edit their own staff's contact info only, through the
 * scoped /microfinance or /agency endpoint (see UpdateManagedUserRequest server-side).
 */
export default async function EditUserPage(props: PageProps<"/utilisateurs/[id]">) {
  const caller = await requireUser();
  const dev = isDeveloper(caller);
  const canManage = hasPermission(caller, "manage_users");
  if (!dev && !canManage) redirect("/dashboard");

  const { id } = await props.params;

  if (dev) {
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

    // A Développeur has no flat "/utilisateurs" list of their own (see
    // UtilisateursPage), so editing staff reached from an agency's detail page
    // must return there instead of falling back to "/utilisateurs" and
    // bouncing straight to "/microfinances".
    const { from } = await props.searchParams;
    const backHref = typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : "/utilisateurs";

    const boundUpdate = updateUserAction.bind(null, user.id, backHref);

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

  // No scoped "show one user" endpoint exists for Super Admin/Chef Agence — reuse
  // the same list endpoint the /utilisateurs page already scopes to their agency
  // or microfinance, and pick the target out of it.
  const endpoint = isMicrofinanceOwner(caller) ? "/microfinance/users" : "/agency/users";
  const { data: users } = await apiFetch<ApiEnvelope<ManagedUser[]>>(endpoint);
  const user = users.find((candidate) => candidate.id === id);
  if (!user) notFound();

  const boundUpdate = updateManagedUserAction.bind(null, user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{fullName(user)}</h1>
        <p className="text-sm text-muted-foreground">{user.role?.name ?? "—"}</p>
      </div>

      <ManagedUserForm
        defaultValues={{
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          email: user.email,
          is_agent: user.is_agent,
        }}
        onSubmit={boundUpdate}
      />
    </div>
  );
}
