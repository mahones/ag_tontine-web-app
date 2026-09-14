import { requireSuperAdmin } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { ApiEnvelope, Prospect } from "@/lib/types";
import { ProspectsTable } from "./prospects-table";

export const metadata = {
  title: "Prospects — Tontine",
};

export default async function ProspectsPage() {
  const user = await requireSuperAdmin();

  // The backend ignores the {agency} route segment and always scopes to the caller's own
  // agency_id — passed here anyway in case that ever changes server-side.
  const { data: prospects } = await apiFetch<ApiEnvelope<Prospect[]>>(
    `/prospects/agency/${user.agency_id}`,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prospects</h1>
        <p className="text-sm text-muted-foreground">
          Prospects enregistrés par les agents de terrain de votre siège, en attente de
          conversion en client.
        </p>
      </div>

      <ProspectsTable prospects={prospects} />
    </div>
  );
}
