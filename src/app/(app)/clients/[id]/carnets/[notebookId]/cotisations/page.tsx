import Link from "next/link";
import { WalletIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApiEnvelope, Client, Collection, Loan, MonthlyContribution, Notebook } from "@/lib/types";
import { formatPersonName } from "@/lib/format-name";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ClientBadge } from "@/components/client-badge";
import { CollectionCreateForm } from "./collection-create-form";
import { createCollectionAction } from "./actions";
import { LoanActionDialog } from "../prets/loan-action-dialog";
import { createLoanAction, updateLoanStatusAction, disburseLoanAction } from "../prets/actions";

// "approved" counts as open too: it still blocks a new submission (CreateLoanAction)
// until the Caissier disburses it — otherwise this page would offer "Octroyer un
// prêt" again instead of showing the approved loan waiting to be disbursed.
const OPEN_LOAN_STATUSES: Loan["status"][] = ["pending", "approved", "active"];

export const metadata = {
  title: "Cotisations — Tontine",
};

export default async function CollectionsPage(
  props: PageProps<"/clients/[id]/carnets/[notebookId]/cotisations">,
) {
  const user = await requirePermission("view_clients");
  const { id, notebookId } = await props.params;
  const { month } = await props.searchParams;

  let notebook: Notebook;
  try {
    const response = await apiFetch<ApiEnvelope<Notebook>>(`/notebooks/${notebookId}`);
    notebook = response.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  const [{ data: client }, { data: months }] = await Promise.all([
    apiFetch<ApiEnvelope<Client>>(`/clients/${id}`),
    apiFetch<ApiEnvelope<MonthlyContribution[]>>(`/monthly-contributions/notebook/${notebookId}`),
  ]);
  // A carnet holds up to 12 months x 31 boxes = 372 collections — this page paginates the
  // history one month at a time instead of listing everything at once. New collections
  // always land on the latest (current) month, never an older one already full.
  const latestMonth = months.reduce((max, entry) => Math.max(max, entry.month), 1);
  const selectedMonth = month && !Array.isArray(month) && Number(month) > 0 ? Number(month) : latestMonth;
  const isCurrentMonth = selectedMonth === latestMonth;

  const { data: collections } = await apiFetch<ApiEnvelope<Collection[]>>(
    `/collections/notebook/${notebookId}?month=${selectedMonth}`,
  );
  const { data: loans } = await apiFetch<ApiEnvelope<Loan[]>>(`/loans/notebook/${notebookId}`);
  const openLoan = loans.find((loan) => OPEN_LOAN_STATUSES.includes(loan.status)) ?? null;
  const canRegister = hasPermission(user, "register_contribution_agence");
  const canSubmitLoan = hasPermission(user, "submit_loan");
  const canApproveLoan = hasPermission(user, "approve_loan");
  const canDisburseLoan = hasPermission(user, "disburse_loan");
  const boundCreate = createCollectionAction.bind(null, notebookId, id);
  const boundCreateLoan = createLoanAction.bind(null, notebookId, id);
  const boundUpdateLoanStatus = openLoan
    ? updateLoanStatusAction.bind(null, openLoan.id, id, notebookId)
    : null;
  const boundDisburseLoan = openLoan
    ? disburseLoanAction.bind(null, openLoan.id, id, notebookId)
    : null;

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Clients", href: "/clients" },
          { label: formatPersonName(client.first_name, client.last_name), href: `/clients/${id}` },
          { label: `Carnet ${notebook.notebook_number}`, href: `/clients/${id}/carnets/${notebookId}` },
          { label: "Cotisations" },
        ]}
      />
      <ClientBadge clientId={id} firstName={client.first_name} lastName={client.last_name} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cotisations — Carnet {notebook.notebook_number}</h1>
          <p className="text-sm text-muted-foreground">
            Cotisation mensuelle actuelle : {notebook.contribution_amount}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LoanActionDialog
            clientId={id}
            notebookId={notebookId}
            canSubmit={canSubmitLoan}
            canApprove={canApproveLoan}
            canDisburse={canDisburseLoan}
            openLoan={openLoan}
            onSubmitLoan={boundCreateLoan}
            onUpdateStatus={boundUpdateLoanStatus}
            onDisburse={boundDisburseLoan}
          />
          <Link href={`/clients/${id}/carnets/${notebookId}/retraits`} className={buttonVariants({ variant: "outline" })}>
            <WalletIcon />
            Retrait
          </Link>
        </div>
      </div>

      {isCurrentMonth ? (
        canRegister ? (
          <CollectionCreateForm contributionAmount={Number(notebook.contribution_amount)} onSubmit={boundCreate} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Vous n&apos;avez pas la permission d&apos;enregistrer une cotisation.
          </p>
        )
      ) : (
        <p className="text-sm text-muted-foreground">
          Mois {selectedMonth} déjà clos — les nouvelles cotisations sont toujours ajoutées au
          mois en cours (mois {latestMonth}).
        </p>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-medium tracking-tight">
            Historique du mois {selectedMonth} ({collections.length})
          </h2>
          {months.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {months.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/clients/${id}/carnets/${notebookId}/cotisations?month=${entry.month}`}
                  className={buttonVariants({
                    variant: entry.month === selectedMonth ? "default" : "outline",
                    size: "sm",
                  })}
                >
                  Mois {entry.month}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Case n°</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Enregistrée par</TableHead>
                <TableHead>Effets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Aucune cotisation enregistrée pour ce mois.
                  </TableCell>
                </TableRow>
              ) : (
                collections.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(collection.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>{collection.box_number}</TableCell>
                    <TableCell>{collection.amount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {collection.user ? `${collection.user.first_name} ${collection.user.last_name}` : "—"}
                    </TableCell>
                    <TableCell className="space-x-1">
                      {collection.agency_box && <Badge variant="secondary">Case agence</Badge>}
                      {collection.repayment_made && <Badge variant="secondary">Affectée au remboursement</Badge>}
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
