"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EyeIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Loan, PaginationMeta } from "@/lib/types";
import { useListQuery } from "@/hooks/use-list-query";
import {
  LOAN_STATUS_BADGE_VARIANT,
  LOAN_STATUS_LABELS,
  LOAN_TYPE_LABELS,
} from "@/app/(app)/clients/[id]/carnets/[notebookId]/prets/schema";
import { PendingLoanActions } from "@/app/(app)/dashboard/pending-loan-actions";
import { LoanDisburseAction } from "./loan-disburse-action";

export const ALL_STATUSES = "all";
const STATUS_ITEMS = [
  { value: ALL_STATUSES, label: "Tous les statuts" },
  ...Object.entries(LOAN_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export function LoansTable({
  loans,
  meta,
  initialSearch = "",
  initialStatus = ALL_STATUSES,
  showAgencyColumn = false,
  canApprove = false,
  canDisburse = false,
}: {
  loans: Loan[];
  meta: PaginationMeta;
  initialSearch?: string;
  initialStatus?: string;
  showAgencyColumn?: boolean;
  /** Shows Approuver/Rejeter next to pending loans — mirrors the dashboard's own
   * "Prêts en attente" quick actions (see PendingLoanActions). */
  canApprove?: boolean;
  /** Shows Décaisser next to approved loans. */
  canDisburse?: boolean;
}) {
  const { search, setSearch, setPage } = useListQuery(initialSearch);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Always sets an explicit ?status= (including "all") so a role-based server default
  // (see prets/page.tsx) only ever applies before the caller has touched this filter.
  function setStatus(status: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status || ALL_STATUSES);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const columnCount = showAgencyColumn ? 7 : 6;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par client, type, statut…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-8"
          />
        </div>
        <Select items={STATUS_ITEMS} value={initialStatus} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_ITEMS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>N° carnet</TableHead>
              <TableHead>Client</TableHead>
              {showAgencyColumn && <TableHead>Agence</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead>Montant à décaisser</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount + 1} className="py-8 text-center text-muted-foreground">
                  Aucun prêt trouvé.
                </TableCell>
              </TableRow>
            ) : (
              loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {loan.notebook?.client ? (
                      <Link
                        href={`/clients/${loan.notebook.client.id}/carnets/${loan.notebook.id}/prets/${loan.id}`}
                        className="hover:underline"
                      >
                        {new Date(loan.loan_date).toLocaleDateString("fr-FR")}
                      </Link>
                    ) : (
                      new Date(loan.loan_date).toLocaleDateString("fr-FR")
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {loan.notebook?.notebook_number ?? "—"}
                  </TableCell>
                  <TableCell>
                    {loan.notebook?.client
                      ? `${loan.notebook.client.first_name} ${loan.notebook.client.last_name}`
                      : "—"}
                  </TableCell>
                  {showAgencyColumn && (
                    <TableCell className="text-sm text-muted-foreground">
                      {loan.notebook?.agency?.name ?? "—"}
                    </TableCell>
                  )}
                  <TableCell>{LOAN_TYPE_LABELS[loan.type_loan]}</TableCell>
                  <TableCell>{loan.amount_loaned}</TableCell>
                  <TableCell>
                    <Badge variant={LOAN_STATUS_BADGE_VARIANT[loan.status]}>
                      {LOAN_STATUS_LABELS[loan.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      {canApprove && loan.status === "pending" && <PendingLoanActions loan={loan} />}
                      {loan.notebook?.client && (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Link
                                href={`/clients/${loan.notebook.client.id}/carnets/${loan.notebook.id}`}
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
                      {canDisburse && loan.status === "approved" && <LoanDisburseAction loan={loan} />}
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
