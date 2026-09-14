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

export function UtilisateursTable({ users }: { users: ManagedUser[] }) {
  const [search, setSearch] = useState("");

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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
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
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <ToggleUserActifButton id={user.id} isActive={user.is_active} />
                      <Link
                        href={`/utilisateurs/${user.id}`}
                        className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                      >
                        <PencilIcon />
                        <span className="sr-only">Modifier {fullName(user)}</span>
                      </Link>
                      <DeleteUserButton id={user.id} name={fullName(user)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
