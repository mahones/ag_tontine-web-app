import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import type { ApiEnvelope, Loan } from "@/lib/types";
import { LOAN_STATUS_LABELS, LOAN_TYPE_LABELS } from "../schema";
import { LoanStatusForm } from "../loan-status-form";
import { updateLoanStatusAction } from "../actions";

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

  const boundUpdate = updateLoanStatusAction.bind(null, loan.id, id, notebookId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prêt {LOAN_TYPE_LABELS[loan.type_loan]}</h1>
        <p className="text-sm text-muted-foreground">
          Montant prêté {loan.amount_loaned} · Frais de dossier {loan.file_fees} · Gain agence{" "}
          {loan.agency_gain} · Statut actuel : {LOAN_STATUS_LABELS[loan.status]}
        </p>
      </div>

      {hasPermission(user, "approve_loan") ? (
        <LoanStatusForm onSubmit={boundUpdate} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Vous n&apos;avez pas la permission d&apos;approuver ou de rejeter ce prêt.
        </p>
      )}
    </div>
  );
}
