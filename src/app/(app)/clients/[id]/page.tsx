import Link from "next/link";
import { notFound } from "next/navigation";
import { CoinsIcon, EyeIcon, HandCoinsIcon, PiggyBankIcon, PlusIcon, WalletIcon } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApiEnvelope, Client, ClientStats, Notebook } from "@/lib/types";
import { formatFirstName, formatLastName, formatPersonName } from "@/lib/format-name";
import { ClientEditForm } from "../client-edit-form";
import { updateClientAction } from "../actions";

export const metadata = {
  title: "Détail client — Tontine",
};

const NOTEBOOK_STATUS_LABELS: Record<Notebook["status"], string> = {
  active: "Actif",
  completed: "Terminé",
  cancelled: "Annulé",
  closed: "Clôturé",
};

const numberFormatter = new Intl.NumberFormat("fr-FR");

export default async function ClientDetailPage(props: PageProps<"/clients/[id]">) {
  const user = await requirePermission("view_clients");
  const { id } = await props.params;

  let client: Client;
  try {
    const response = await apiFetch<ApiEnvelope<Client>>(`/clients/${id}`);
    client = response.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  const [{ data: notebooks }, { data: stats }] = await Promise.all([
    apiFetch<ApiEnvelope<Notebook[]>>(`/notebooks/client/${id}`),
    apiFetch<ApiEnvelope<ClientStats>>(`/clients/${id}/stats`),
  ]);
  const boundUpdate = updateClientAction.bind(null, client.id);
  const canCreateNotebook = hasPermission(user, "create_notebook");
  // Matches ClientPolicy::update on the backend: editing client info is Chef Agence/
  // Gestionnaire/Super Admin's job, not Caissier's (registers contributions/withdrawals only).
  const canEditClient = hasPermission(user, "create_client");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {formatPersonName(client.first_name, client.last_name)}
        </h1>
        <p className="text-sm text-muted-foreground">{client.phone}</p>
        <p className="text-sm text-muted-foreground">
          Agent assigné :{" "}
          {client.agents && client.agents.length > 0
            ? client.agents
                .map((agent) => formatPersonName(agent.first_name, agent.last_name))
                .join(", ")
            : "—"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Sommes disponibles</CardDescription>
            <CardTitle className="text-3xl">{numberFormatter.format(Number(stats.available_balance))}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Retraits</CardDescription>
            <CardTitle className="text-3xl">{stats.withdrawals.count}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total : {numberFormatter.format(Number(stats.withdrawals.total))}
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Prêts</CardDescription>
            <CardTitle className="text-3xl">{stats.loans.count}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total : {numberFormatter.format(Number(stats.loans.total))}
            </p>
          </CardHeader>
        </Card>
      </div>

      {canEditClient ? (
        <ClientEditForm
          defaultValues={{
            first_name: client.first_name,
            last_name: client.last_name,
            phone: client.phone,
            address: client.address,
          }}
          onSubmit={boundUpdate}
        />
      ) : (
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Prénom : </span>
            {formatFirstName(client.first_name)}
          </p>
          <p>
            <span className="text-muted-foreground">Nom : </span>
            {formatLastName(client.last_name)}
          </p>
          <p>
            <span className="text-muted-foreground">Téléphone : </span>
            {client.phone}
          </p>
          <p>
            <span className="text-muted-foreground">Adresse : </span>
            {client.address}
          </p>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium tracking-tight">Carnets ({notebooks.length})</h2>
          {canCreateNotebook && (
            <Link href={`/clients/${client.id}/carnets/nouveau`} className={buttonVariants({ size: "sm" })}>
              <PlusIcon />
              Nouveau carnet
            </Link>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>Cotisation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notebooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Aucun carnet pour ce client.
                  </TableCell>
                </TableRow>
              ) : (
                notebooks.map((notebook) => (
                  <TableRow key={notebook.id}>
                    <TableCell className="font-mono text-xs">{notebook.notebook_number}</TableCell>
                    <TableCell>{notebook.year}</TableCell>
                    <TableCell>{notebook.contribution_amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          notebook.status === "active" ? "success" : notebook.status === "closed" ? "destructive" : "secondary"
                        }
                      >
                        {NOTEBOOK_STATUS_LABELS[notebook.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Link
                                href={`/clients/${client.id}/carnets/${notebook.id}`}
                                className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                              />
                            }
                          >
                            <EyeIcon />
                            <span className="sr-only">Voir le carnet {notebook.notebook_number}</span>
                          </TooltipTrigger>
                          <TooltipContent>Voir le carnet</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Link
                                href={`/clients/${client.id}/carnets/${notebook.id}/cotisations`}
                                className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                              />
                            }
                          >
                            <PiggyBankIcon />
                            <span className="sr-only">Cotisations du carnet {notebook.notebook_number}</span>
                          </TooltipTrigger>
                          <TooltipContent>Cotisations</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Link
                                href={`/clients/${client.id}/carnets/${notebook.id}/prets`}
                                className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                              />
                            }
                          >
                            <HandCoinsIcon />
                            <span className="sr-only">Prêts du carnet {notebook.notebook_number}</span>
                          </TooltipTrigger>
                          <TooltipContent>Prêts</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Link
                                href={`/clients/${client.id}/carnets/${notebook.id}/retraits`}
                                className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                              />
                            }
                          >
                            <WalletIcon />
                            <span className="sr-only">Retraits du carnet {notebook.notebook_number}</span>
                          </TooltipTrigger>
                          <TooltipContent>Retraits</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Link
                                href={`/clients/${client.id}/carnets/${notebook.id}/mises`}
                                className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                              />
                            }
                          >
                            <CoinsIcon />
                            <span className="sr-only">Mises du carnet {notebook.notebook_number}</span>
                          </TooltipTrigger>
                          <TooltipContent>Mises</TooltipContent>
                        </Tooltip>
                      </div>
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
