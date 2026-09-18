import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type {
  ApiEnvelope,
  Collection,
  Loan,
  MonthlyContribution,
  Notebook,
  NotebookState,
  Withdrawal,
} from "@/lib/types";
import { NOTEBOOK_STATUS_LABELS } from "../schema";
import { LOAN_STATUS_BADGE_VARIANT, LOAN_STATUS_LABELS, LOAN_TYPE_LABELS } from "./prets/schema";
import { WITHDRAWAL_MODE_LABELS } from "./retraits/schema";

export const metadata = {
  title: "Détail carnet — Tontine",
};

// Each overview table on this page is a preview — full history lives on its own
// dedicated page (see the "Voir tout" links), reached in one click.
const ROW_LIMIT = 5;

export default async function NotebookDetailPage(props: PageProps<"/clients/[id]/carnets/[notebookId]">) {
  const user = await requirePermission("view_clients");
  const { id, notebookId } = await props.params;

  let notebook: Notebook;
  try {
    const response = await apiFetch<ApiEnvelope<Notebook>>(`/notebooks/${notebookId}`);
    notebook = response.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  const canSeeLoans = hasPermission(user, "see_loans");
  const canSeeWithdrawals = hasPermission(user, "view_withdrawals");

  const [{ data: state }, { data: months }, { data: loans }, { data: withdrawals }] = await Promise.all([
    apiFetch<ApiEnvelope<NotebookState>>(`/notebooks/${notebookId}/state`),
    apiFetch<ApiEnvelope<MonthlyContribution[]>>(`/monthly-contributions/notebook/${notebookId}`),
    canSeeLoans
      ? apiFetch<ApiEnvelope<Loan[]>>(`/loans/notebook/${notebookId}`)
      : Promise.resolve({ data: [] as Loan[] }),
    canSeeWithdrawals
      ? apiFetch<ApiEnvelope<Withdrawal[]>>(`/withdrawals/notebook/${notebookId}`)
      : Promise.resolve({ data: [] as Withdrawal[] }),
  ]);

  // Cotisations overview shows the latest (current) month only — full month-by-month
  // history stays on the dedicated Cotisations page (see "Voir tout" link below).
  const latestMonth = months.reduce((max, entry) => Math.max(max, entry.month), 1);
  const { data: collections } = await apiFetch<ApiEnvelope<Collection[]>>(
    `/collections/notebook/${notebookId}?month=${latestMonth}`,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Carnet {notebook.notebook_number}</h1>
        <p className="text-sm text-muted-foreground">
          Année {notebook.year} · Cotisation {notebook.contribution_amount} · Statut actuel :{" "}
          {NOTEBOOK_STATUS_LABELS[notebook.status]}
        </p>
        <p className="text-sm text-muted-foreground">Agence : {state.agency_name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Montant total cotisé</CardDescription>
            <CardTitle className="text-3xl">{state.total_amount_collected}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Cases cochées</CardDescription>
            <CardTitle className="text-3xl">{state.total_boxes}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Cases agence</CardDescription>
            <CardTitle className="text-3xl">{state.agency_boxes}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Mois écoulés</CardDescription>
            <CardTitle className="text-3xl">{state.months_count}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Mois restants</CardDescription>
            <CardTitle className="text-3xl">{state.months_remaining}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {canSeeLoans && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-medium tracking-tight">Prêts ({loans.length})</h2>
              <Link href={`/clients/${id}/carnets/${notebook.id}/prets`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Voir tout
              </Link>
            </div>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant prêté</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                        Aucun prêt pour ce carnet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    loans.slice(0, ROW_LIMIT).map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          <Link href={`/clients/${id}/carnets/${notebook.id}/prets/${loan.id}`} className="hover:underline">
                            {new Date(loan.loan_date).toLocaleDateString("fr-FR")}
                          </Link>
                        </TableCell>
                        <TableCell>{LOAN_TYPE_LABELS[loan.type_loan]}</TableCell>
                        <TableCell>{loan.amount_loaned}</TableCell>
                        <TableCell>
                          <Badge variant={LOAN_STATUS_BADGE_VARIANT[loan.status]}>{LOAN_STATUS_LABELS[loan.status]}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-medium tracking-tight">Mises ({months.length})</h2>
            <Link href={`/clients/${id}/carnets/${notebook.id}/mises`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Voir tout
            </Link>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mois</TableHead>
                  <TableHead>Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {months.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                      Aucune mise enregistrée pour ce carnet.
                    </TableCell>
                  </TableRow>
                ) : (
                  months.slice(0, ROW_LIMIT).map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.month}</TableCell>
                      <TableCell>{entry.amount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium tracking-tight">
            Cotisations — mois {latestMonth} ({collections.length})
          </h2>
          <Link href={`/clients/${id}/carnets/${notebook.id}/cotisations`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            Voir tout
          </Link>
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
                collections.slice(0, ROW_LIMIT).map((collection) => (
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

      {canSeeWithdrawals && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-medium tracking-tight">Retraits ({withdrawals.length})</h2>
            <Link href={`/clients/${id}/carnets/${notebook.id}/retraits`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Voir tout
            </Link>
          </div>
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
                  withdrawals.slice(0, ROW_LIMIT).map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(withdrawal.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>{withdrawal.amount}</TableCell>
                      <TableCell>{withdrawal.agency_gain ?? "—"}</TableCell>
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
      )}
    </div>
  );
}
