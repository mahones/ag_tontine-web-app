"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PencilIcon, SearchIcon } from "lucide-react";
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
import type { Configuration, Microfinance, PaginationMeta } from "@/lib/types";
import { useListQuery } from "@/hooks/use-list-query";
import { DeleteConfigurationButton } from "./delete-configuration-button";

export function ConfigurationsTable({
  configurations,
  microfinances,
  meta,
  initialSearch = "",
}: {
  configurations: Configuration[];
  microfinances: Microfinance[];
  meta: PaginationMeta;
  initialSearch?: string;
}) {
  const { search, setSearch, setPage } = useListQuery(initialSearch);

  const microfinanceNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const microfinance of microfinances) map.set(microfinance.id, microfinance.name);
    return map;
  }, [microfinances]);

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par clé, valeur ou microfinance…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-8"
        />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Microfinance</TableHead>
              <TableHead>Clé</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configurations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Aucune configuration trouvée.
                </TableCell>
              </TableRow>
            ) : (
              configurations.map((configuration) => (
                <TableRow key={configuration.id}>
                  <TableCell>
                    {microfinanceNames.get(configuration.microfinance_id) ?? configuration.microfinance_id}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{configuration.key}</TableCell>
                  <TableCell className="max-w-xs truncate">{configuration.value}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Link
                              href={`/configurations/${configuration.id}`}
                              className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                            />
                          }
                        >
                          <PencilIcon />
                          <span className="sr-only">Modifier {configuration.key}</span>
                        </TooltipTrigger>
                        <TooltipContent>Modifier</TooltipContent>
                      </Tooltip>
                      <DeleteConfigurationButton id={configuration.id} name={configuration.key} />
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
