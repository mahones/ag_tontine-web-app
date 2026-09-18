import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireSuperAdminOrDeveloper } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { isDeveloper } from "@/lib/roles";
import { buttonVariants } from "@/components/ui/button";
import { buildListQuery, currentSearchValue } from "@/lib/list-query";
import type { Agency, PaginatedEnvelope } from "@/lib/types";
import { AgencesTable } from "./agences-table";

export const metadata = {
  title: "Agences — Tontine",
};

/**
 * Serves Super Admin (own microfinance, via /microfinance/agencies) and Développeur
 * (whole platform, via /agencies — onlydev). "Nouvelle agence" is hidden for
 * Développeur: AgencyController::store is Super-Admin-only (microfinance_owner
 * group), there's no platform-wide equivalent.
 */
export default async function AgencesPage(props: PageProps<"/agences">) {
  const user = await requireSuperAdminOrDeveloper();
  const dev = isDeveloper(user);

  const searchParams = await props.searchParams;
  const endpoint = dev ? "/agencies" : "/microfinance/agencies";
  const { data: agencies, meta } = await apiFetch<PaginatedEnvelope<Agency>>(
    `${endpoint}${buildListQuery(searchParams)}`,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agences</h1>
          <p className="text-sm text-muted-foreground">
            {dev ? "Agences de toute la plateforme." : "Agences de votre microfinance."}
          </p>
        </div>
        {!dev && (
          <Link href="/agences/nouveau" className={buttonVariants()}>
            <PlusIcon />
            Nouvelle agence
          </Link>
        )}
      </div>

      <AgencesTable agencies={agencies} meta={meta} initialSearch={currentSearchValue(searchParams)} />
    </div>
  );
}
