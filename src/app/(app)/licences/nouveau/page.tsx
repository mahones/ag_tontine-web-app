import { requireDeveloper } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { ApiEnvelope, Microfinance } from "@/lib/types";
import { LicenceForm } from "../licence-form";
import { createLicenceAction } from "../actions";

export const metadata = {
  title: "Nouvelle licence — Tontine",
};

export default async function NewLicencePage() {
  await requireDeveloper();

  const { data: microfinances } = await apiFetch<ApiEnvelope<Microfinance[]>>("/microfinances");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouvelle licence</h1>
        <p className="text-sm text-muted-foreground">
          La clé de licence est générée automatiquement à la création.
        </p>
      </div>

      <LicenceForm microfinances={microfinances} onSubmit={createLicenceAction} submitLabel="Créer la licence" />
    </div>
  );
}
