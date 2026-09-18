import { notFound } from "next/navigation";
import { requireDeveloper } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import type { ApiEnvelope, Microfinance } from "@/lib/types";
import { MicrofinanceForm } from "../microfinance-form";
import { updateMicrofinanceAction } from "../actions";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata = {
  title: "Modifier une microfinance — Tontine",
};

export default async function EditMicrofinancePage(props: PageProps<"/microfinances/[id]">) {
  await requireDeveloper();
  const { id } = await props.params;

  let microfinance: Microfinance;
  try {
    const response = await apiFetch<ApiEnvelope<Microfinance>>(`/microfinances/${id}`);
    microfinance = response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const boundUpdate = updateMicrofinanceAction.bind(null, microfinance.id);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Microfinances", href: "/microfinances" }, { label: microfinance.name }]} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{microfinance.name}</h1>
        <p className="font-mono text-sm text-muted-foreground">{microfinance.code}</p>
      </div>

      <MicrofinanceForm
        defaultValues={{
          name: microfinance.name,
          country: microfinance.country,
          logo: microfinance.logo ?? "",
          primary_color: microfinance.primary_color,
          local_server_url: microfinance.local_server_url,
        }}
        onSubmit={boundUpdate}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
