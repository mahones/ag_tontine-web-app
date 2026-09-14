import { requireDeveloper } from "@/lib/auth";
import { MicrofinanceForm } from "../microfinance-form";
import { createMicrofinanceAction } from "../actions";

export const metadata = {
  title: "Nouvelle microfinance — Tontine",
};

export default async function NewMicrofinancePage() {
  await requireDeveloper();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouvelle microfinance</h1>
        <p className="text-sm text-muted-foreground">
          Le code de la microfinance est généré automatiquement à la création.
        </p>
      </div>

      <MicrofinanceForm onSubmit={createMicrofinanceAction} submitLabel="Créer la microfinance" />
    </div>
  );
}
