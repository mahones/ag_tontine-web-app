import { requireSuperAdminOrDeveloper } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { isDeveloper } from "@/lib/roles";
import { buildListQuery, currentSearchValue } from "@/lib/list-query";
import type { PaginatedEnvelope, Prospect } from "@/lib/types";
import { ProspectsTable } from "./prospects-table";

export const metadata = {
  title: "Prospects — Tontine",
};

/**
 * Serves Super Admin (own microfinance, via /prospects/agency/{agency} — the backend
 * ignores the {agency} segment and always scopes to the caller's own agency_id, passed
 * here anyway in case that ever changes server-side) and Développeur (whole platform,
 * via /prospects — onlydev).
 */
export default async function ProspectsPage(props: PageProps<"/prospects">) {
  const user = await requireSuperAdminOrDeveloper();
  const dev = isDeveloper(user);

  const searchParams = await props.searchParams;

  const endpoint = dev ? "/prospects" : `/prospects/agency/${user.agency_id}`;
  const { data: prospects, meta } = await apiFetch<PaginatedEnvelope<Prospect>>(
    `${endpoint}${buildListQuery(searchParams)}`,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prospects</h1>
        <p className="text-sm text-muted-foreground">
          {dev
            ? "Prospects enregistrés par les agents de terrain de toute la plateforme, en attente de conversion en client."
            : "Prospects enregistrés par les agents de terrain de votre siège, en attente de conversion en client."}
        </p>
      </div>

      <ProspectsTable prospects={prospects} meta={meta} initialSearch={currentSearchValue(searchParams)} />
    </div>
  );
}
