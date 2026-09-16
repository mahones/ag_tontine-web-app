"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EyeIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Agency } from "@/lib/types";

export function MicrofinanceAgencesTable({
  microfinanceId,
  agencies,
}: {
  microfinanceId: string;
  agencies: Agency[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return agencies;
    return agencies.filter((agency) =>
      [agency.code_agency, agency.name, agency.address, agency.phone].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [agencies, search]);

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par code, nom, adresse…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Devise</TableHead>
              <TableHead>Siège</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Aucune agence trouvée.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((agency) => (
                <TableRow key={agency.id}>
                  <TableCell className="font-mono text-xs">{agency.code_agency}</TableCell>
                  <TableCell className="font-medium">{agency.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{agency.address}</TableCell>
                  <TableCell>{agency.phone}</TableCell>
                  <TableCell>{agency.currency?.code ?? "—"}</TableCell>
                  <TableCell>{agency.is_headquarters && <Badge variant="default">Siège</Badge>}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Link
                              href={`/microfinances/${microfinanceId}/agences/${agency.id}`}
                              className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                            />
                          }
                        >
                          <EyeIcon />
                          <span className="sr-only">Voir le détail de {agency.name}</span>
                        </TooltipTrigger>
                        <TooltipContent>Voir</TooltipContent>
                      </Tooltip>
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
