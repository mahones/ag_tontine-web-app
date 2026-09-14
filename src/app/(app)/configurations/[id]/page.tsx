import { notFound } from "next/navigation";
import { requireDeveloper } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import type { ApiEnvelope, Configuration, Microfinance } from "@/lib/types";
import { ConfigurationForm } from "../configuration-form";
import { updateConfigurationAction } from "../actions";

export const metadata = {
  title: "Modifier une configuration — Tontine",
};

export default async function EditConfigurationPage(props: PageProps<"/configurations/[id]">) {
  await requireDeveloper();
  const { id } = await props.params;

  let configuration: Configuration;
  try {
    const response = await apiFetch<ApiEnvelope<Configuration>>(`/configurations/${id}`);
    configuration = response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { data: microfinances } = await apiFetch<ApiEnvelope<Microfinance[]>>("/microfinances");
  const boundUpdate = updateConfigurationAction.bind(null, configuration.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{configuration.key}</h1>
      </div>

      <ConfigurationForm
        microfinances={microfinances}
        defaultValues={{
          microfinance_id: configuration.microfinance_id,
          key: configuration.key,
          value: configuration.value,
        }}
        onSubmit={boundUpdate}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
