import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import type { ApiEnvelope, Agency } from "@/lib/types";
import { AgencyForm } from "../agence-form";
import { updateAgencyAction } from "../actions";

export const metadata = {
  title: "Modifier une agence — Tontine",
};

export default async function EditAgencyPage(props: PageProps<"/agences/[id]">) {
  await requireSuperAdmin();
  const { id } = await props.params;

  let agency: Agency;
  try {
    const response = await apiFetch<ApiEnvelope<Agency>>(`/agencies/${id}`);
    agency = response.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  const boundUpdate = updateAgencyAction.bind(null, agency.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{agency.name}</h1>
        <p className="font-mono text-sm text-muted-foreground">{agency.code_agency}</p>
      </div>

      <AgencyForm
        defaultValues={{
          name: agency.name,
          address: agency.address,
          phone: agency.phone,
          is_headquarters: agency.is_headquarters,
          currency_id: agency.currency?.id ?? "",
        }}
        onSubmit={boundUpdate}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
