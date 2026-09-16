"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PaginationMeta, Prospect } from "@/lib/types";
import { formatPersonName } from "@/lib/format-name";
import { useListQuery } from "@/hooks/use-list-query";

const STATUS_LABELS: Record<Prospect["status"], string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
  converted: "Converti",
};

const STATUS_BADGE_VARIANT: Record<Prospect["status"], "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  converted: "default",
};

export function ProspectsTable({
  prospects,
  meta,
  initialSearch = "",
}: {
  prospects: Prospect[];
  meta: PaginationMeta;
  initialSearch?: string;
}) {
  const { search, setSearch, setPage } = useListQuery(initialSearch);

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, téléphone, adresse…"
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
              <TableHead>Téléphone</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Pièce d&apos;identité</TableHead>
              <TableHead>Cotisation prévue</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Assigné à l&apos;agent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prospects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Aucun prospect trouvé.
                </TableCell>
              </TableRow>
            ) : (
              prospects.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell className="font-medium">
                    {formatPersonName(prospect.first_name, prospect.last_name)}
                  </TableCell>
                  <TableCell>{prospect.phone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{prospect.address}</TableCell>
                  <TableCell className="font-mono text-xs">{prospect.id_piece}</TableCell>
                  <TableCell>{prospect.contribution_amount}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[prospect.status]}>
                      {STATUS_LABELS[prospect.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {prospect.agent
                      ? formatPersonName(prospect.agent.first_name, prospect.agent.last_name)
                      : "—"}
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
