import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireDeveloper } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { buildListQuery, currentSearchValue } from "@/lib/list-query";
import type { ApiEnvelope, Licence, Microfinance, PaginatedEnvelope } from "@/lib/types";
import { LicencesTable } from "./licences-table";

export const metadata = {
  title: "Licences — Tontine",
};

export default async function LicencesPage(props: PageProps<"/licences">) {
  await requireDeveloper();

  const searchParams = await props.searchParams;

  const [{ data: licences, meta }, { data: microfinances }] = await Promise.all([
    apiFetch<PaginatedEnvelope<Licence>>(`/licences${buildListQuery(searchParams)}`),
    apiFetch<ApiEnvelope<Microfinance[]>>("/microfinances"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Licences</h1>
          <p className="text-sm text-muted-foreground">
            Licences accordées aux microfinances de la plateforme.
          </p>
        </div>
        <Link href="/licences/nouveau" className={buttonVariants()}>
          <PlusIcon />
          Nouvelle licence
        </Link>
      </div>

      <LicencesTable
        licences={licences}
        microfinances={microfinances}
        meta={meta}
        initialSearch={currentSearchValue(searchParams)}
      />
    </div>
  );
}
