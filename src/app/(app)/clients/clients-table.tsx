"use client";

import Link from "next/link";
import { EyeIcon, SearchIcon } from "lucide-react";
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
import type { Client, PaginationMeta } from "@/lib/types";
import { formatPersonName } from "@/lib/format-name";
import { useListQuery } from "@/hooks/use-list-query";

export function ClientsTable({
  clients,
  meta,
  initialSearch = "",
  paramNames,
}: {
  clients: Client[];
  meta: PaginationMeta;
  initialSearch?: string;
  /** Namespaces the URL's page/search params — needed when another paginated
   * list shares the same page (e.g. the agency detail page's Personnel table). */
  paramNames?: { page?: string; search?: string };
}) {
  const { search, setSearch, setPage } = useListQuery(initialSearch, paramNames);

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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Aucun client trouvé.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    {formatPersonName(client.first_name, client.last_name)}
                  </TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{client.address}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Link
                              href={`/clients/${client.id}`}
                              className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                            />
                          }
                        >
                          <EyeIcon />
                          <span className="sr-only">
                            Voir {formatPersonName(client.first_name, client.last_name)}
                          </span>
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

      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
}
