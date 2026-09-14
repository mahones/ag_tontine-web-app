import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApiEnvelope, Loan, Repayment } from "@/lib/types";
import { LOAN_STATUS_LABELS, LOAN_TYPE_LABELS } from "../schema";
import { LoanStatusForm } from "../loan-status-form";
import { updateLoanStatusAction } from "../actions";
import { RepaymentCreateForm } from "./repayment-create-form";
import { createRepaymentAction } from "./actions";

export const metadata = {
  title: "Détail prêt — Tontine",
};

export default async function LoanDetailPage(
  props: PageProps<"/clients/[id]/carnets/[notebookId]/prets/[loanId]">,
) {
  const user = await requirePermission("see_loans");
  const { id, notebookId, loanId } = await props.params;

  let loan: Loan;
  try {
    const response = await apiFetch<ApiEnvelope<Loan>>(`/loans/${loanId}`);
    loan = response.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  const { data: repayments } = await apiFetch<ApiEnvelope<Repayment[]>>(`/repayments/loan/${loanId}`);
  const totalPaid = repayments.reduce((sum, repayment) => sum + Number(repayment.amount_paid), 0);
  // Indicative only: mirrors the simple amount_loaned + file_fees - paid formula that
  // CreateCollectionAction itself uses for "quinzaine"/"trimestriel" loans. That action's
  // "mensuel" branch computes the target differently (it subtracts already-paid amounts
  // from the target before comparing, effectively double-counting them), so the real
  // internal remaining balance for a mensuel loan can diverge from this display — not
  // fixed here, see PENDING.md.
  const totalDue = Number(loan.amount_loaned) + Number(loan.file_fees);
  const remaining = Math.max(0, totalDue - totalPaid);

  const boundUpdate = updateLoanStatusAction.bind(null, loan.id, id, notebookId);
  const boundCreateRepayment = createRepaymentAction.bind(null, loan.id, id, notebookId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prêt {LOAN_TYPE_LABELS[loan.type_loan]}</h1>
        <p className="text-sm text-muted-foreground">
          Montant prêté {loan.amount_loaned} · Frais de dossier {loan.file_fees} · Gain agence{" "}
          {loan.agency_gain} · Statut actuel : {LOAN_STATUS_LABELS[loan.status]}
        </p>
        <p className="text-sm text-muted-foreground">
          Total remboursé {totalPaid.toFixed(2)} · Solde restant (indicatif) {remaining.toFixed(2)}
        </p>
      </div>

      {hasPermission(user, "approve_loan") ? (
        <LoanStatusForm onSubmit={boundUpdate} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Vous n&apos;avez pas la permission d&apos;approuver ou de rejeter ce prêt.
        </p>
      )}

      <RepaymentCreateForm onSubmit={boundCreateRepayment} />

      <div>
        <h2 className="mb-3 text-lg font-medium tracking-tight">Remboursements ({repayments.length})</h2>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                    Aucun remboursement pour ce prêt.
                  </TableCell>
                </TableRow>
              ) : (
                repayments.map((repayment) => (
                  <TableRow key={repayment.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(repayment.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>{repayment.amount_paid}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
