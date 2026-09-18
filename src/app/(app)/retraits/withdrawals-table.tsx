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
import type { PaginationMeta, Withdrawal } from "@/lib/types";
import { formatAmount } from "@/lib/format-currency";
import { useListQuery } from "@/hooks/use-list-query";
import { WITHDRAWAL_MODE_LABELS } from "@/app/(app)/clients/[id]/carnets/[notebookId]/retraits/schema";

export function WithdrawalsTable({
  withdrawals,
  meta,
  initialSearch = "",
  showAgencyColumn = false,
}: {
  withdrawals: Withdrawal[];
  meta: PaginationMeta;
  initialSearch?: string;
  showAgencyColumn?: boolean;
}) {
  const { search, setSearch, setPage } = useListQuery(initialSearch);

  const columnCount = showAgencyColumn ? 7 : 6;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par client, mode…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>N° carnet</TableHead>
              <TableHead>Client</TableHead>
              {showAgencyColumn && <TableHead>Agence</TableHead>}
              <TableHead>Montant</TableHead>
              <TableHead>Gain agence</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount + 1} className="py-8 text-center text-muted-foreground">
                  Aucun retrait trouvé.
                </TableCell>
              </TableRow>
            ) : (
              withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(withdrawal.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {withdrawal.notebook?.notebook_number ?? "—"}
                  </TableCell>
                  <TableCell>
                    {withdrawal.notebook?.client
                      ? `${withdrawal.notebook.client.first_name} ${withdrawal.notebook.client.last_name}`
                      : "—"}
                  </TableCell>
                  {showAgencyColumn && (
                    <TableCell className="text-sm text-muted-foreground">
                      {withdrawal.notebook?.agency?.name ?? "—"}
                    </TableCell>
                  )}
                  <TableCell className="font-mono">{formatAmount(withdrawal.amount)}</TableCell>
                  <TableCell className="font-mono">
                    {withdrawal.agency_gain ? formatAmount(withdrawal.agency_gain) : "—"}
                  </TableCell>
                  <TableCell>
                    {WITHDRAWAL_MODE_LABELS[withdrawal.withdrawal_mode as keyof typeof WITHDRAWAL_MODE_LABELS] ??
                      withdrawal.withdrawal_mode}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      {withdrawal.notebook?.client && (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Link
                                href={`/clients/${withdrawal.notebook.client.id}/carnets/${withdrawal.notebook.id}/retraits`}
                                className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                              />
                            }
                          >
                            <EyeIcon />
                            <span className="sr-only">Voir le carnet</span>
                          </TooltipTrigger>
                          <TooltipContent>Voir le carnet</TooltipContent>
                        </Tooltip>
                      )}
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
