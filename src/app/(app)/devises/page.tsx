import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireDeveloper } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import type { ApiEnvelope, Currency } from "@/lib/types";
import { DevisesTable } from "./devises-table";

export const metadata = {
  title: "Devises — Tontine",
};

export default async function DevisesPage() {
  await requireDeveloper();

  const { data: currencies } = await apiFetch<ApiEnvelope<Currency[]>>("/currencies");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Devises</h1>
          <p className="text-sm text-muted-foreground">
            Devises disponibles pour les agences de la plateforme.
          </p>
        </div>
        <Link href="/devises/nouveau" className={buttonVariants()}>
          <PlusIcon />
          Nouvelle devise
        </Link>
      </div>

      <DevisesTable currencies={currencies} />
    </div>
  );
}
