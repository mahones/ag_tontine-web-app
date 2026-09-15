import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireDeveloper } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { buildListQuery, currentSearchValue } from "@/lib/list-query";
import type { ApiEnvelope, Configuration, Microfinance, PaginatedEnvelope } from "@/lib/types";
import { ConfigurationsTable } from "./configurations-table";

export const metadata = {
  title: "Configurations — Tontine",
};

export default async function ConfigurationsPage(props: PageProps<"/configurations">) {
  await requireDeveloper();

  const searchParams = await props.searchParams;

  const [{ data: configurations, meta }, { data: microfinances }] = await Promise.all([
    apiFetch<PaginatedEnvelope<Configuration>>(`/configurations${buildListQuery(searchParams)}`),
    apiFetch<ApiEnvelope<Microfinance[]>>("/microfinances"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configurations</h1>
          <p className="text-sm text-muted-foreground">
            Paramètres clé/valeur rattachés à une microfinance.
          </p>
        </div>
        <Link href="/configurations/nouveau" className={buttonVariants()}>
          <PlusIcon />
          Nouvelle configuration
        </Link>
      </div>

      <ConfigurationsTable
        configurations={configurations}
        microfinances={microfinances}
        meta={meta}
        initialSearch={currentSearchValue(searchParams)}
      />
    </div>
  );
}
