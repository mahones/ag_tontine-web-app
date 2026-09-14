import { notFound } from "next/navigation";
import { requireDeveloper } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import type { ApiEnvelope, Currency } from "@/lib/types";
import { CurrencyForm } from "../devise-form";
import { updateCurrencyAction } from "../actions";

export const metadata = {
  title: "Modifier une devise — Tontine",
};

export default async function EditCurrencyPage(props: PageProps<"/devises/[id]">) {
  await requireDeveloper();
  const { id } = await props.params;

  let currency: Currency;
  try {
    const response = await apiFetch<ApiEnvelope<Currency>>(`/currencies/${id}`);
    currency = response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const boundUpdate = updateCurrencyAction.bind(null, currency.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{currency.name}</h1>
        <p className="font-mono text-sm text-muted-foreground">{currency.code}</p>
      </div>

      <CurrencyForm
        defaultValues={{ code: currency.code, name: currency.name }}
        onSubmit={boundUpdate}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
