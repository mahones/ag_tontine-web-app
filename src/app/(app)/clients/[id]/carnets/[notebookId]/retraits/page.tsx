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
import type { ApiEnvelope, Client, Collection, Loan, Notebook, Withdrawal } from "@/lib/types";
import { formatPersonName } from "@/lib/format-name";
import { formatAmount } from "@/lib/format-currency";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ClientBadge } from "@/components/client-badge";
import { WITHDRAWAL_MODE_LABELS } from "./schema";
import { WithdrawalCreateForm } from "./withdrawal-create-form";
import { WithdrawalGainForm } from "./withdrawal-gain-form";
import { createWithdrawalAction, createWithdrawalOnLoanGainAction } from "./actions";

export const metadata = {
  title: "Retraits — Tontine",
};

export default async function WithdrawalsPage(props: PageProps<"/clients/[id]/carnets/[notebookId]/retraits">) {
  const user = await requirePermission("view_withdrawals");
  const { id, notebookId } = await props.params;

  let notebook: Notebook;
  try {
    const response = await apiFetch<ApiEnvelope<Notebook>>(`/notebooks/${notebookId}`);
    notebook = response.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  const [{ data: client }, { data: withdrawals }, { data: loans }, { data: collections }] = await Promise.all([
    apiFetch<ApiEnvelope<Client>>(`/clients/${id}`),
    apiFetch<ApiEnvelope<Withdrawal[]>>(`/withdrawals/notebook/${notebookId}`),
    apiFetch<ApiEnvelope<Loan[]>>(`/loans/notebook/${notebookId}`),
    apiFetch<ApiEnvelope<Collection[]>>(`/collections/notebook/${notebookId}`),
  ]);

  const activeLoan = loans.find((loan) => loan.status === "active");
  const gainsRemainingLoan = loans.find((loan) => loan.status === "gains_remaining");
  // Indicative only: mirrors CreateWithdrawalAction's own availableAmount formula
  // (sum of non-agency, not-yet-repayment-applied collections minus withdrawals already
  // made). The server recomputes this itself and is the real source of truth.
  const totalCollected = collections
    .filter((collection) => !collection.agency_box && !collection.repayment_made)
    .reduce((sum, collection) => sum + Number(collection.amount), 0);
  const totalWithdrawn = withdrawals.reduce((sum, withdrawal) => sum + Number(withdrawal.amount), 0);
  const availableAmount = Math.max(0, totalCollected - totalWithdrawn);

  const canValidate = hasPermission(user, "validate_withdrawal");
  const boundCreate = createWithdrawalAction.bind(null, notebookId, id);
  const boundCreateGain = createWithdrawalOnLoanGainAction.bind(null, notebookId, id);

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Clients", href: "/clients" },
          { label: formatPersonName(client.first_name, client.last_name), href: `/clients/${id}` },
          { label: `Carnet ${notebook.notebook_number}`, href: `/clients/${id}/carnets/${notebookId}` },
          { label: "Retraits" },
        ]}
      />
      <ClientBadge clientId={id} firstName={client.first_name} lastName={client.last_name} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Retraits — Carnet {notebook.notebook_number}</h1>
        <p className="text-sm text-muted-foreground">Montant disponible (indicatif) : {formatAmount(availableAmount)}</p>
      </div>

      {canValidate ? (
        activeLoan ? (
          <p className="text-sm text-muted-foreground">
            Ce carnet a un prêt actif — les retraits sont bloqués tant qu&apos;il n&apos;est pas soldé.
          </p>
        ) : gainsRemainingLoan ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Ce carnet a un prêt en attente de solde de gain (gain agence :{" "}
              {formatAmount(gainsRemainingLoan.agency_gain)}) — le retrait normal est remplacé par le
              règlement de ce gain, qui clôture le prêt.
            </p>
            <WithdrawalGainForm onSubmit={boundCreateGain} />
          </div>
        ) : (
          <WithdrawalCreateForm onSubmit={boundCreate} />
        )
      ) : (
        <p className="text-sm text-muted-foreground">
          Vous n&apos;avez pas la permission de valider un retrait.
        </p>
      )}

      <div>
        <h2 className="mb-3 text-lg font-medium tracking-tight">Historique ({withdrawals.length})</h2>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Gain agence</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Validé par</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Aucun retrait pour ce carnet.
                  </TableCell>
                </TableRow>
              ) : (
                withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(withdrawal.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="font-mono">{formatAmount(withdrawal.amount)}</TableCell>
                    <TableCell className="font-mono">
                      {withdrawal.agency_gain ? formatAmount(withdrawal.agency_gain) : "—"}
                    </TableCell>
                    <TableCell>
                      {WITHDRAWAL_MODE_LABELS[withdrawal.withdrawal_mode as keyof typeof WITHDRAWAL_MODE_LABELS] ??
                        withdrawal.withdrawal_mode}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {withdrawal.validator
                        ? `${withdrawal.validator.first_name} ${withdrawal.validator.last_name}`
                        : "—"}
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
