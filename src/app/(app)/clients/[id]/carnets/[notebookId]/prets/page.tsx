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
import type { ApiEnvelope, Client, Loan, Notebook } from "@/lib/types";
import { formatPersonName } from "@/lib/format-name";
import { formatAmount } from "@/lib/format-currency";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ClientBadge } from "@/components/client-badge";
import {
  LOAN_STATUS_BADGE_VARIANT,
  LOAN_STATUS_LABELS,
  LOAN_TYPE_LABELS,
  computeMontantADecaisser,
} from "./schema";
import { LoanCreateForm } from "./loan-create-form";
import { LoanApproveButton } from "./loan-approve-button";
import { LoanDisburseButton } from "./loan-disburse-button";
import { createLoanAction, updateLoanStatusAction, disburseLoanAction } from "./actions";

export const metadata = {
  title: "Prêts — Tontine",
};

// "approved" counts as open too: it still blocks a new submission (CreateLoanAction)
// until the Caissier disburses it — mirrors cotisations/page.tsx's OPEN_LOAN_STATUSES.
const OPEN_STATUSES: Loan["status"][] = ["pending", "approved", "active"];

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

  const [{ data: client }, { data: loans }] = await Promise.all([
    apiFetch<ApiEnvelope<Client>>(`/clients/${id}`),
    apiFetch<ApiEnvelope<Loan[]>>(`/loans/notebook/${notebookId}`),
  ]);
  const openLoan = loans.find((loan) => OPEN_STATUSES.includes(loan.status)) ?? null;
  const canSubmit = hasPermission(user, "submit_loan");
  const canApprove = hasPermission(user, "approve_loan");
  const canDisburse = hasPermission(user, "disburse_loan");
  const boundCreate = createLoanAction.bind(null, notebookId, id);
  const boundUpdateStatus = openLoan ? updateLoanStatusAction.bind(null, openLoan.id, id, notebookId) : null;
  const boundDisburse = openLoan ? disburseLoanAction.bind(null, openLoan.id, id, notebookId) : null;

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Clients", href: "/clients" },
          { label: formatPersonName(client.first_name, client.last_name), href: `/clients/${id}` },
          { label: `Carnet ${notebook.notebook_number}`, href: `/clients/${id}/carnets/${notebookId}` },
          { label: "Prêts" },
        ]}
      />
      <ClientBadge clientId={id} firstName={client.first_name} lastName={client.last_name} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prêts — Carnet {notebook.notebook_number}</h1>
      </div>

      {canSubmit ? (
        openLoan ? (
          <p className="text-sm text-muted-foreground">
            Ce carnet a déjà un prêt en attente, approuvé ou actif — aucun nouveau prêt ne peut être
            soumis tant qu&apos;il n&apos;est pas soldé.
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
          {canDisburse && openLoan?.status === "approved" && boundDisburse && (
            <LoanDisburseButton onSubmit={boundDisburse} />
          )}
        </div>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant à décaisser</TableHead>
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
                    <TableCell className="font-mono">{formatAmount(computeMontantADecaisser(loan))}</TableCell>
                    <TableCell className="font-mono">{formatAmount(loan.file_fees)}</TableCell>
                    <TableCell className="font-mono">{formatAmount(loan.agency_gain)}</TableCell>
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
