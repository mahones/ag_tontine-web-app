import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { buildListQuery, currentSearchValue } from "@/lib/list-query";
import type { Agency, PaginatedEnvelope } from "@/lib/types";
import { AgencesTable } from "./agences-table";

export const metadata = {
  title: "Agences — Tontine",
};

export default async function AgencesPage(props: PageProps<"/agences">) {
  await requireSuperAdmin();

  const searchParams = await props.searchParams;
  const { data: agencies, meta } = await apiFetch<PaginatedEnvelope<Agency>>(
    `/microfinance/agencies${buildListQuery(searchParams)}`,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agences</h1>
          <p className="text-sm text-muted-foreground">
            Agences de votre microfinance.
          </p>
        </div>
        <Link href="/agences/nouveau" className={buttonVariants()}>
          <PlusIcon />
          Nouvelle agence
        </Link>
      </div>

      <AgencesTable agencies={agencies} meta={meta} initialSearch={currentSearchValue(searchParams)} />
    </div>
  );
}
