"use client";

import { useMemo } from "react";
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
import type { Licence, Microfinance, PaginationMeta } from "@/lib/types";
import { useListQuery } from "@/hooks/use-list-query";
import { LICENCE_STATUS_LABELS } from "./schema";
import { CopyLicenceKeyButton } from "./copy-licence-key-button";
import { DeleteLicenceButton } from "./delete-licence-button";

const STATUS_BADGE_VARIANT: Record<Licence["status"], "success" | "secondary" | "destructive"> = {
  active: "success",
  expired: "destructive",
  revoked: "destructive",
};

export function LicencesTable({
  licences,
  microfinances,
  meta,
  initialSearch = "",
}: {
  licences: Licence[];
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
          placeholder="Rechercher par clé ou microfinance…"
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
              <TableHead>Période</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {licences.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Aucune licence trouvée.
                </TableCell>
              </TableRow>
            ) : (
              licences.map((licence) => (
                <TableRow key={licence.id}>
                  <TableCell>{microfinanceNames.get(licence.microfinance_id) ?? licence.microfinance_id}</TableCell>
                  <TableCell className="max-w-[240px] whitespace-normal">
                    <div className="flex items-start gap-1.5">
                      <span className="font-mono text-xs break-all">{licence.licence_key}</span>
                      <CopyLicenceKeyButton licenceKey={licence.licence_key} />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {licence.start_date} → {licence.end_date}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[licence.status]}>
                      {LICENCE_STATUS_LABELS[licence.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Link
                              href={`/licences/${licence.id}`}
                              className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                            />
                          }
                        >
                          <PencilIcon />
                          <span className="sr-only">Modifier {licence.licence_key}</span>
                        </TooltipTrigger>
                        <TooltipContent>Modifier</TooltipContent>
                      </Tooltip>
                      <DeleteLicenceButton id={licence.id} licenceKey={licence.licence_key} />
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
