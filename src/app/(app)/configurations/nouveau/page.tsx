import { requireDeveloper } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { ApiEnvelope, Microfinance } from "@/lib/types";
import { ConfigurationForm } from "../configuration-form";
import { createConfigurationAction } from "../actions";

export const metadata = {
  title: "Nouvelle configuration — Tontine",
};

export default async function NewConfigurationPage() {
  await requireDeveloper();

  const { data: microfinances } = await apiFetch<ApiEnvelope<Microfinance[]>>("/microfinances");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouvelle configuration</h1>
      </div>

      <ConfigurationForm
        microfinances={microfinances}
        onSubmit={createConfigurationAction}
        submitLabel="Créer la configuration"
      />
    </div>
  );
}
