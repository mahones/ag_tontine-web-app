import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireAgent } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { buildListQuery, currentSearchValue } from "@/lib/list-query";
import type { PaginatedEnvelope, Prospect } from "@/lib/types";
import { AgentProspectsTable } from "./prospects-table";

export const metadata = {
  title: "Mes prospects — Tontine",
};

/**
 * Previews the /mobile/myprospects route on the web console ahead of the real mobile app.
 */
export default async function AgentProspectsPage(props: PageProps<"/agent/prospects">) {
  await requireAgent();

  const searchParams = await props.searchParams;
  const { data: prospects, meta } = await apiFetch<PaginatedEnvelope<Prospect>>(
    `/mobile/myprospects${buildListQuery(searchParams)}`,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mes prospects</h1>
          <p className="text-sm text-muted-foreground">Prospects que vous avez enregistrés sur le terrain.</p>
        </div>
        <Link href="/agent/prospects/nouveau" className={buttonVariants()}>
          <PlusIcon />
          Nouveau prospect
        </Link>
      </div>

      <AgentProspectsTable prospects={prospects} meta={meta} initialSearch={currentSearchValue(searchParams)} />
    </div>
  );
}
