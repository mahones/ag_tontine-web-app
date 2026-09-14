import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireDeveloper } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import type { ApiEnvelope, Role } from "@/lib/types";
import { RolesTable } from "./roles-table";

export const metadata = {
  title: "Rôles — Tontine",
};

export default async function RolesPage() {
  await requireDeveloper();

  const { data: roles } = await apiFetch<ApiEnvelope<Role[]>>("/roles");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rôles</h1>
          <p className="text-sm text-muted-foreground">
            Rôles disponibles pour les comptes de la plateforme.
          </p>
        </div>
        <Link href="/roles/nouveau" className={buttonVariants()}>
          <PlusIcon />
          Nouveau rôle
        </Link>
      </div>

      <RolesTable roles={roles} />
    </div>
  );
}
