import { notFound } from "next/navigation";
import { requireAgent } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import type { ApiEnvelope, Prospect } from "@/lib/types";
import { ProspectForm } from "../prospect-form";
import { updateProspectAction } from "../actions";

export const metadata = {
  title: "Modifier un prospect — Tontine",
};

export default async function EditAgentProspectPage(props: PageProps<"/agent/prospects/[id]">) {
  await requireAgent();
  const { id } = await props.params;

  let prospect: Prospect;
  try {
    const response = await apiFetch<ApiEnvelope<Prospect>>(`/prospects/${id}`);
    prospect = response.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  const boundUpdate = updateProspectAction.bind(null, prospect.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {prospect.first_name} {prospect.last_name}
        </h1>
      </div>

      <ProspectForm
        defaultValues={{
          first_name: prospect.first_name,
          last_name: prospect.last_name,
          phone: prospect.phone,
          address: prospect.address,
          id_piece: prospect.id_piece,
          contribution_amount: Number(prospect.contribution_amount),
        }}
        onSubmit={boundUpdate}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
