import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Loan } from "@/lib/types";
import { LOAN_TYPE_LABELS } from "@/app/(app)/clients/[id]/carnets/[notebookId]/prets/schema";
import { PendingLoanActions } from "./pending-loan-actions";

/**
 * "Prêts en attente d'approbation" list — reused on the main dashboard and on the
 * Développeur's microfinance/agency drill-down pages (each backed by its own scoped
 * endpoint, see ListPendingApprovalLoansAction). `showAgencyColumn` is only useful
 * where a single list can span several agencies (main dashboard for Super
 * Admin/Développeur, microfinance detail page) — the agency detail page already
 * implies one agency, so it stays off there.
 */
export function PendingLoansTable({
  loans,
  showAgencyColumn = false,
}: {
  loans: Loan[];
  showAgencyColumn?: boolean;
}) {
  if (loans.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-lg font-medium tracking-tight">
        Prêts en attente d&apos;approbation ({loans.length})
      </h2>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              {showAgencyColumn && <TableHead>Agence</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(loan.loan_date).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell>
                  {loan.notebook?.client ? (
                    <Link
                      href={`/clients/${loan.notebook.client.id}/carnets/${loan.notebook.id}/prets/${loan.id}`}
                      className="hover:underline"
                    >
                      {loan.notebook.client.first_name} {loan.notebook.client.last_name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                {showAgencyColumn && (
                  <TableCell className="text-sm text-muted-foreground">
                    {loan.notebook?.agency?.name ?? "—"}
                  </TableCell>
                )}
                <TableCell>{LOAN_TYPE_LABELS[loan.type_loan]}</TableCell>
                <TableCell>{loan.amount_loaned}</TableCell>
                <TableCell>
                  <Badge variant="warning">En attente</Badge>
                </TableCell>
                <TableCell>
                  <PendingLoanActions loan={loan} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
