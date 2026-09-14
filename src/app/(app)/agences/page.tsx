import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import type { ApiEnvelope, Agency } from "@/lib/types";
import { AgencesTable } from "./agences-table";

export const metadata = {
  title: "Agences — Tontine",
};

export default async function AgencesPage() {
  await requireSuperAdmin();

  const { data: agencies } = await apiFetch<ApiEnvelope<Agency[]>>("/microfinance/agencies");

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

      <AgencesTable agencies={agencies} />
    </div>
  );
}
