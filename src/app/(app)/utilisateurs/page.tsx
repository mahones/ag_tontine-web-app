import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireDeveloper } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import type { ApiEnvelope, ManagedUser } from "@/lib/types";
import { UtilisateursTable } from "./utilisateurs-table";

export const metadata = {
  title: "Utilisateurs — Tontine",
};

export default async function UtilisateursPage() {
  await requireDeveloper();

  const { data: users } = await apiFetch<ApiEnvelope<ManagedUser[]>>("/users");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">
            Comptes de la plateforme, tous rôles et agences confondus.
          </p>
        </div>
        <Link href="/utilisateurs/nouveau" className={buttonVariants()}>
          <PlusIcon />
          Nouvel utilisateur
        </Link>
      </div>

      <UtilisateursTable users={users} />
    </div>
  );
}
