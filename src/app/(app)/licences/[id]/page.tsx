import { notFound } from "next/navigation";
import { requireDeveloper } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import type { ApiEnvelope, Licence, Microfinance } from "@/lib/types";
import { LicenceForm } from "../licence-form";
import { CopyLicenceKeyButton } from "../copy-licence-key-button";
import { updateLicenceAction } from "../actions";

export const metadata = {
  title: "Modifier une licence — Tontine",
};

export default async function EditLicencePage(props: PageProps<"/licences/[id]">) {
  await requireDeveloper();
  const { id } = await props.params;

  let licence: Licence;
  try {
    const response = await apiFetch<ApiEnvelope<Licence>>(`/licences/${id}`);
    licence = response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { data: microfinances } = await apiFetch<ApiEnvelope<Microfinance[]>>("/microfinances");
  const boundUpdate = updateLicenceAction.bind(null, licence.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-2">
        <h1 className="max-w-full font-mono text-xl font-semibold tracking-tight break-all">
          {licence.licence_key}
        </h1>
        <CopyLicenceKeyButton licenceKey={licence.licence_key} />
      </div>

      <LicenceForm
        microfinances={microfinances}
        defaultValues={{
          microfinance_id: licence.microfinance_id,
          start_date: licence.start_date,
          end_date: licence.end_date,
          status: licence.status,
        }}
        onSubmit={boundUpdate}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
