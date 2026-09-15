import { requireAgent } from "@/lib/auth";
import { ProspectForm } from "../prospect-form";
import { createProspectAction } from "../actions";

export const metadata = {
  title: "Nouveau prospect — Tontine",
};

export default async function NewAgentProspectPage() {
  await requireAgent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouveau prospect</h1>
        <p className="text-sm text-muted-foreground">
          Enregistré sous votre nom, dans votre agence — comme le ferait l&apos;app mobile.
        </p>
      </div>

      <ProspectForm onSubmit={createProspectAction} submitLabel="Créer le prospect" />
    </div>
  );
}
