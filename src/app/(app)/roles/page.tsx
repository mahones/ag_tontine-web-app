import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireDeveloper } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { buildListQuery, currentSearchValue } from "@/lib/list-query";
import type { PaginatedEnvelope, Role } from "@/lib/types";
import { RolesTable } from "./roles-table";

export const metadata = {
  title: "Rôles — Tontine",
};

export default async function RolesPage(props: PageProps<"/roles">) {
  await requireDeveloper();

  const searchParams = await props.searchParams;
  const { data: roles, meta } = await apiFetch<PaginatedEnvelope<Role>>(`/roles${buildListQuery(searchParams)}`);

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

      <RolesTable roles={roles} meta={meta} initialSearch={currentSearchValue(searchParams)} />
    </div>
  );
}
