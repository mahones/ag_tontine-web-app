"use client";

import Link from "next/link";
import { BuildingIcon, PencilIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
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
import type { Microfinance, PaginationMeta } from "@/lib/types";
import { useListQuery } from "@/hooks/use-list-query";
import { DeleteMicrofinanceButton } from "./delete-microfinance-button";

export function MicrofinancesTable({
  microfinances,
  meta,
  initialSearch = "",
}: {
  microfinances: Microfinance[];
  meta: PaginationMeta;
  initialSearch?: string;
}) {
  const { search, setSearch, setPage } = useListQuery(initialSearch);

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, code ou pays…"
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
              <TableHead>Pays</TableHead>
              <TableHead>Couleur</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {microfinances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Aucune microfinance trouvée.
                </TableCell>
              </TableRow>
            ) : (
              microfinances.map((microfinance) => (
                <TableRow key={microfinance.id}>
                  <TableCell className="font-mono text-xs">{microfinance.code}</TableCell>
                  <TableCell className="font-medium">{microfinance.name}</TableCell>
                  <TableCell>{microfinance.country}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block size-3.5 rounded-full border"
                        style={{ backgroundColor: microfinance.primary_color }}
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {microfinance.primary_color}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Link
                              href={`/microfinances/${microfinance.id}/agences`}
                              className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                            />
                          }
                        >
                          <BuildingIcon />
                          <span className="sr-only">Voir les agences de {microfinance.name}</span>
                        </TooltipTrigger>
                        <TooltipContent>Agences</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Link
                              href={`/microfinances/${microfinance.id}`}
                              className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                            />
                          }
                        >
                          <PencilIcon />
                          <span className="sr-only">Modifier {microfinance.name}</span>
                        </TooltipTrigger>
                        <TooltipContent>Modifier</TooltipContent>
                      </Tooltip>
                      <DeleteMicrofinanceButton id={microfinance.id} name={microfinance.name} />
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
