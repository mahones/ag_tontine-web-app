import { requirePermission } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { ApiEnvelope, Prospect } from "@/lib/types";
import { ClientCreateForm } from "../client-create-form";
import { createClientAction } from "../actions";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata = {
  title: "Nouveau client — Tontine",
};

export default async function NewClientPage() {
  await requirePermission("create_client");

  const { data: prospects } = await apiFetch<ApiEnvelope<Prospect[]>>("/agency/prospects");
  const availableProspects = prospects.filter((prospect) => prospect.status !== "converted");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Clients", href: "/clients" }, { label: "Nouveau client" }]} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouveau client</h1>
        <p className="text-sm text-muted-foreground">
          Le nom, le téléphone et l&apos;adresse sont repris automatiquement du prospect choisi.
        </p>
      </div>

      <ClientCreateForm prospects={availableProspects} onSubmit={createClientAction} />
    </div>
  );
}
