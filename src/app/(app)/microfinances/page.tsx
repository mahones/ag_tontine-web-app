import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireDeveloper } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import type { ApiEnvelope, Microfinance } from "@/lib/types";
import { MicrofinancesTable } from "./microfinances-table";

export const metadata = {
  title: "Microfinances — Tontine",
};

export default async function MicrofinancesPage() {
  await requireDeveloper();

  const { data: microfinances } = await apiFetch<ApiEnvelope<Microfinance[]>>("/microfinances");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Microfinances</h1>
          <p className="text-sm text-muted-foreground">
            Créez une microfinance avant d&apos;y rattacher une agence et son propriétaire.
          </p>
        </div>
        <Link href="/microfinances/nouveau" className={buttonVariants()}>
          <PlusIcon />
          Nouvelle microfinance
        </Link>
      </div>

      <MicrofinancesTable microfinances={microfinances} />
    </div>
  );
}
