"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PencilIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fullName } from "@/lib/roles";
import type { ManagedUser } from "@/lib/types";
import { DeleteUserButton } from "./delete-user-button";
import { ToggleUserActifButton } from "./toggle-user-actif-button";

export function UtilisateursTable({
  users,
  canManage = true,
  canEdit = canManage,
  callerRoleLevel = null,
}: {
  users: ManagedUser[];
  /** Toggle-active and delete — Développeur only. */
  canManage?: boolean;
  /** Edit link, shown per row only for users the caller outranks (see rowIsEditable). */
  canEdit?: boolean;
  callerRoleLevel?: number | null;
}) {
  const [search, setSearch] = useState("");

  // A Super Admin/Chef Agence can only edit staff with a strictly lower authority
  // (higher role level) than their own — mirrors the hierarchy check UserController
  // enforces server-side. Développeur (canManage) bypasses this entirely.
  function rowIsEditable(user: ManagedUser): boolean {
    if (!canEdit) return false;
    if (canManage) return true;
    if (callerRoleLevel === null || user.role == null) return false;
    return callerRoleLevel < user.role.level;
  }

  const actionsEnabled = canManage || canEdit;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      [fullName(user), user.phone, user.email, user.role?.name ?? "", user.agency?.name ?? ""].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [users, search]);

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, téléphone, email…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Agence</TableHead>
              <TableHead>Statut</TableHead>
              {actionsEnabled && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={actionsEnabled ? 6 : 5} className="py-8 text-center text-muted-foreground">
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{fullName(user)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div>{user.phone}</div>
                    <div>{user.email}</div>
                  </TableCell>
                  <TableCell>{user.role?.name ?? "—"}</TableCell>
                  <TableCell>{user.agency?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  {actionsEnabled && (
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        {canManage && <ToggleUserActifButton id={user.id} isActive={user.is_active} />}
                        {rowIsEditable(user) && (
                          <Link
                            href={`/utilisateurs/${user.id}`}
                            className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                          >
                            <PencilIcon />
                            <span className="sr-only">Modifier {fullName(user)}</span>
                          </Link>
                        )}
                        {canManage && <DeleteUserButton id={user.id} name={fullName(user)} />}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
