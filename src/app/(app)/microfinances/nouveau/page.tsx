import { requireDeveloper } from "@/lib/auth";
import { MicrofinanceForm } from "../microfinance-form";
import { createMicrofinanceAction } from "../actions";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata = {
  title: "Nouvelle microfinance — Tontine",
};

export default async function NewMicrofinancePage() {
  await requireDeveloper();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Microfinances", href: "/microfinances" }, { label: "Nouvelle microfinance" }]} />
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
