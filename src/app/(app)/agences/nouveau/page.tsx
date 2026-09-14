import { requireSuperAdmin } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ApiEnvelope, Agency } from "@/lib/types";
import { AgencyForm } from "../agence-form";
import { createAgencyAction } from "../actions";

export const metadata = {
  title: "Nouvelle agence — Tontine",
};

export default async function NewAgencyPage() {
  await requireSuperAdmin();

  const { data: agencies } = await apiFetch<ApiEnvelope<Agency[]>>("/microfinance/agencies");
  // A microfinance operates in a single currency in practice, and there's no API route
  // exposing the currency list to a Super Admin — so a new agency silently inherits the
  // currency of the microfinance's headquarters (falling back to any existing agency).
  const referenceAgency = agencies.find((agency) => agency.is_headquarters) ?? agencies[0];
  const boundCreate = createAgencyAction.bind(null, referenceAgency.currency?.id ?? "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouvelle agence</h1>
        <p className="text-sm text-muted-foreground">
          Le code de l&apos;agence est généré automatiquement à la création.
        </p>
      </div>

      {referenceAgency.currency && (
        <Alert>
          <AlertDescription>
            Cette agence utilisera la même devise que votre siège : {referenceAgency.currency.code} —{" "}
            {referenceAgency.currency.name}.
          </AlertDescription>
        </Alert>
      )}

      <AgencyForm onSubmit={boundCreate} submitLabel="Créer l'agence" />
    </div>
  );
}
