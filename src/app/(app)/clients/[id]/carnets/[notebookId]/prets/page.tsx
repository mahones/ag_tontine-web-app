import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApiEnvelope, Loan, Notebook } from "@/lib/types";
import { LOAN_STATUS_BADGE_VARIANT, LOAN_STATUS_LABELS, LOAN_TYPE_LABELS } from "./schema";
import { LoanCreateForm } from "./loan-create-form";
import { LoanApproveButton } from "./loan-approve-button";
import { createLoanAction, updateLoanStatusAction } from "./actions";

export const metadata = {
  title: "Prêts — Tontine",
};

const OPEN_STATUSES: Loan["status"][] = ["pending", "active"];

export default async function LoansPage(props: PageProps<"/clients/[id]/carnets/[notebookId]/prets">) {
  const user = await requirePermission("see_loans");
  const { id, notebookId } = await props.params;

  let notebook: Notebook;
  try {
    const response = await apiFetch<ApiEnvelope<Notebook>>(`/notebooks/${notebookId}`);
    notebook = response.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  const { data: loans } = await apiFetch<ApiEnvelope<Loan[]>>(`/loans/notebook/${notebookId}`);
  const openLoan = loans.find((loan) => OPEN_STATUSES.includes(loan.status)) ?? null;
  const canSubmit = hasPermission(user, "submit_loan");
  const canApprove = hasPermission(user, "approve_loan");
  const boundCreate = createLoanAction.bind(null, notebookId, id);
  const boundUpdateStatus = openLoan ? updateLoanStatusAction.bind(null, openLoan.id, id, notebookId) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prêts — Carnet {notebook.notebook_number}</h1>
      </div>

      {canSubmit ? (
        openLoan ? (
          <p className="text-sm text-muted-foreground">
            Ce carnet a déjà un prêt en attente ou actif — aucun nouveau prêt ne peut être soumis
            tant qu&apos;il n&apos;est pas soldé.
          </p>
        ) : (
          <LoanCreateForm onSubmit={boundCreate} />
        )
      ) : (
        <p className="text-sm text-muted-foreground">
          Vous n&apos;avez pas la permission de soumettre un prêt.
        </p>
      )}

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-medium tracking-tight">Historique ({loans.length})</h2>
          {canApprove && openLoan?.status === "pending" && boundUpdateStatus && (
            <LoanApproveButton onSubmit={boundUpdateStatus} />
          )}
        </div>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant prêté</TableHead>
                <TableHead>Frais de dossier</TableHead>
                <TableHead>Gain agence</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Aucun prêt pour ce carnet.
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      <Link href={`/clients/${id}/carnets/${notebookId}/prets/${loan.id}`} className="hover:underline">
                        {new Date(loan.loan_date).toLocaleDateString("fr-FR")}
                      </Link>
                    </TableCell>
                    <TableCell>{LOAN_TYPE_LABELS[loan.type_loan]}</TableCell>
                    <TableCell>{loan.amount_loaned}</TableCell>
                    <TableCell>{loan.file_fees}</TableCell>
                    <TableCell>{loan.agency_gain}</TableCell>
                    <TableCell>
                      <Badge variant={LOAN_STATUS_BADGE_VARIANT[loan.status]}>
                        {LOAN_STATUS_LABELS[loan.status]}
                      </Badge>
                    </TableCell>
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
