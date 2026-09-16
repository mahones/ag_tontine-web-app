import { requireSuperAdmin } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { ApiEnvelope, Agency, Currency } from "@/lib/types";
import { AgencyForm } from "../agence-form";
import { createAgencyAction } from "../actions";

export const metadata = {
  title: "Nouvelle agence — Tontine",
};

export default async function NewAgencyPage() {
  await requireSuperAdmin();

  const [{ data: agencies }, { data: currencies }] = await Promise.all([
    apiFetch<ApiEnvelope<Agency[]>>("/microfinance/agencies"),
    apiFetch<ApiEnvelope<Currency[]>>("/microfinance/currencies"),
  ]);
  // Default to the headquarters' currency (falling back to any existing agency's) since a
  // microfinance operates in a single currency in practice, but the Super Admin can now
  // pick a different one from the platform's full list.
  const referenceAgency = agencies.find((agency) => agency.is_headquarters) ?? agencies[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouvelle agence</h1>
        <p className="text-sm text-muted-foreground">
          Le code de l&apos;agence est généré automatiquement à la création.
        </p>
      </div>

      <AgencyForm
        currencies={currencies}
        defaultValues={{ currency_id: referenceAgency?.currency?.id ?? "" }}
        onSubmit={createAgencyAction}
        submitLabel="Créer l'agence"
      />
    </div>
  );
}
