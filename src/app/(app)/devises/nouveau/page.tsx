import { requireDeveloper } from "@/lib/auth";
import { CurrencyForm } from "../devise-form";
import { createCurrencyAction } from "../actions";

export const metadata = {
  title: "Nouvelle devise — Tontine",
};

export default async function NewCurrencyPage() {
  await requireDeveloper();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouvelle devise</h1>
      </div>

      <CurrencyForm onSubmit={createCurrencyAction} submitLabel="Créer la devise" />
    </div>
  );
}
