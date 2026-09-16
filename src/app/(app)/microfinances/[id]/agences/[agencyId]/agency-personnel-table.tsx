"use client";

import Link from "next/link";
import { PencilIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fullName } from "@/lib/roles";
import type { ManagedUser, PaginationMeta } from "@/lib/types";
import { useListQuery } from "@/hooks/use-list-query";

/** Read-only, paginated staff list for the Développeur's agency detail page. */
export function AgencyPersonnelTable({
  staff,
  meta,
  initialSearch = "",
  paramNames,
  backHref,
}: {
  staff: ManagedUser[];
  meta: PaginationMeta;
  initialSearch?: string;
  paramNames?: { page?: string; search?: string };
  backHref: string;
}) {
  const { search, setSearch, setPage } = useListQuery(initialSearch, paramNames);

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

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Aucun membre du personnel dans cette agence.
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{fullName(member)}</TableCell>
                  <TableCell>{member.role?.name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div>{member.phone}</div>
                    <div>{member.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.is_active ? "success" : "secondary"}>
                      {member.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Link
                              href={`/utilisateurs/${member.id}?from=${encodeURIComponent(backHref)}`}
                              className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                            />
                          }
                        >
                          <PencilIcon />
                          <span className="sr-only">Modifier {fullName(member)}</span>
                        </TooltipTrigger>
                        <TooltipContent>Modifier</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
}
