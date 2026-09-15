import { requireSuperAdmin } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { buildListQuery, currentSearchValue } from "@/lib/list-query";
import type { PaginatedEnvelope, Prospect } from "@/lib/types";
import { ProspectsTable } from "./prospects-table";

export const metadata = {
  title: "Prospects — Tontine",
};

export default async function ProspectsPage(props: PageProps<"/prospects">) {
  const user = await requireSuperAdmin();

  const searchParams = await props.searchParams;

  // The backend ignores the {agency} route segment and always scopes to the caller's own
  // agency_id — passed here anyway in case that ever changes server-side.
  const { data: prospects, meta } = await apiFetch<PaginatedEnvelope<Prospect>>(
    `/prospects/agency/${user.agency_id}${buildListQuery(searchParams)}`,
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

      <ProspectsTable prospects={prospects} meta={meta} initialSearch={currentSearchValue(searchParams)} />
    </div>
  );
}
