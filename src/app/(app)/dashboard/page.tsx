import {
  Building2,
  Clock,
  Coins,
  FileBadge2,
  Landmark,
  Settings,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { isAgent, isChefAgence, isDeveloper, isMicrofinanceOwner } from "@/lib/roles";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCard } from "./dashboard-card";
import { DashboardMonthlyChart } from "./dashboard-monthly-chart";
import { DashboardStatCard } from "./dashboard-stat-card";
import { DashboardStatsGrid } from "./dashboard-stats-grid";
import { PendingLoansTable } from "./pending-loans-table";
import type {
  Agency,
  ApiEnvelope,
  Client,
  Configuration,
  Currency,
  DashboardMonthlyStats,
  DashboardStats,
  Licence,
  Loan,
  ManagedUser,
  Microfinance,
  Prospect,
  Role as RoleType,
} from "@/lib/types";

export const metadata = {
  title: "Tableau de bord — Tontine",
};

/**
 * Each role sees a scope of the same Microfinance → Agency → (Client, User) hierarchy:
 * Développeur (everything), Super Admin (own microfinance), Chef Agence (own agency),
 * Gestionnaire/Caissier (own agency's clients only), Agent (own prospects/clients preview
 * of the /mobile/* routes). Cards link to the existing list pages rather than duplicating
 * them here (they already enforce the same scoping server-side).
 */
export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const user = await requireUser();
  const searchParams = await props.searchParams;
  const yearParam = Array.isArray(searchParams.year) ? searchParams.year[0] : searchParams.year;
  const year = Number(yearParam) || new Date().getFullYear();

  let cards: React.ReactNode = null;
  let stats: DashboardStats | null = null;
  let monthlyStats: DashboardMonthlyStats | null = null;

  if (isDeveloper(user)) {
    const [microfinances, agencies, users, roles, currencies, configurations, licences, statsResponse, monthlyResponse] =
      await Promise.all([
        apiFetch<ApiEnvelope<Microfinance[]>>("/microfinances"),
        apiFetch<ApiEnvelope<Agency[]>>("/agencies"),
        apiFetch<ApiEnvelope<ManagedUser[]>>("/users"),
        apiFetch<ApiEnvelope<RoleType[]>>("/roles"),
        apiFetch<ApiEnvelope<Currency[]>>("/currencies"),
        apiFetch<ApiEnvelope<Configuration[]>>("/configurations"),
        apiFetch<ApiEnvelope<Licence[]>>("/licences"),
        apiFetch<ApiEnvelope<DashboardStats>>("/dashboard/stats"),
        apiFetch<ApiEnvelope<DashboardMonthlyStats>>(`/dashboard/monthly-stats?year=${year}`),
      ]);
    stats = statsResponse.data;
    monthlyStats = monthlyResponse.data;

    cards = (
      <>
        <DashboardCard
          href="/microfinances"
          label="Microfinances"
          count={microfinances.data.length}
          description="Toutes les microfinances de la plateforme."
          icon={Landmark}
        />
        {/* /agences is reserved to Super Admin (exact role level); Développeur browses
            agencies per-microfinance via /microfinances/[id]/agences instead. */}
        <DashboardCard
          href="/microfinances"
          label="Agences"
          count={agencies.data.length}
          description="Toutes agences, toutes microfinances confondues — ouvrez une microfinance pour les voir."
          icon={Building2}
        />
        {/* Same reasoning as Agences above: no flat, cross-microfinance Personnel/Clients
            list exists for Développeur any more — both are reached by opening a microfinance,
            then one of its agencies (see /microfinances/[id]/agences/[agencyId]). */}
        <DashboardCard
          href="/microfinances"
          label="Personnel"
          count={users.data.length}
          description="Tous les comptes de la plateforme — ouvrez une microfinance pour les voir."
          icon={Users}
        />
        <DashboardCard
          href="/roles"
          label="Rôles"
          count={roles.data.length}
          description="Rôles définis."
          icon={ShieldCheck}
        />
        <DashboardCard
          href="/devises"
          label="Devises"
          count={currencies.data.length}
          description="Devises disponibles."
          icon={Coins}
        />
        <DashboardCard
          href="/configurations"
          label="Configurations"
          count={configurations.data.length}
          description="Paramètres techniques."
          icon={Settings}
        />
        <DashboardCard
          href="/licences"
          label="Licences"
          count={licences.data.length}
          description="Licences émises."
          icon={FileBadge2}
        />
      </>
    );
  } else if (isMicrofinanceOwner(user)) {
    const [agencies, users, clients, prospects, statsResponse, monthlyResponse] = await Promise.all([
      apiFetch<ApiEnvelope<Agency[]>>("/microfinance/agencies"),
      apiFetch<ApiEnvelope<ManagedUser[]>>("/microfinance/users"),
      apiFetch<ApiEnvelope<Client[]>>(`/clients/agency/${user.agency_id}`),
      apiFetch<ApiEnvelope<Prospect[]>>(`/prospects/agency/${user.agency_id}`),
      apiFetch<ApiEnvelope<DashboardStats>>("/dashboard/stats"),
      apiFetch<ApiEnvelope<DashboardMonthlyStats>>(`/dashboard/monthly-stats?year=${year}`),
    ]);
    stats = statsResponse.data;
    monthlyStats = monthlyResponse.data;

    cards = (
      <>
        <DashboardCard
          href="/agences"
          label="Agences"
          count={agencies.data.length}
          description="Agences de votre microfinance."
          icon={Building2}
        />
        <DashboardCard
          href="/personnels"
          label="Personnel"
          count={users.data.length}
          description="Comptes de votre microfinance."
          icon={Users}
        />
        <DashboardCard
          href="/clients"
          label="Clients"
          count={clients.data.length}
          description="Clients de votre siège."
          icon={UserCheck}
        />
        <DashboardCard
          href="/prospects"
          label="Prospects"
          count={prospects.data.length}
          description="Prospects en attente de conversion."
          icon={UserPlus}
        />
      </>
    );
  } else if (isChefAgence(user)) {
    const [users, clients, statsResponse, monthlyResponse] = await Promise.all([
      apiFetch<ApiEnvelope<ManagedUser[]>>("/agency/users"),
      apiFetch<ApiEnvelope<Client[]>>(`/clients/agency/${user.agency_id}`),
      apiFetch<ApiEnvelope<DashboardStats>>("/dashboard/stats"),
      apiFetch<ApiEnvelope<DashboardMonthlyStats>>(`/dashboard/monthly-stats?year=${year}`),
    ]);
    stats = statsResponse.data;
    monthlyStats = monthlyResponse.data;

    cards = (
      <>
        <DashboardCard
          href="/personnels"
          label="Personnel"
          count={users.data.length}
          description="Comptes de votre agence."
          icon={Users}
        />
        <DashboardCard
          href="/clients"
          label="Clients"
          count={clients.data.length}
          description="Clients de votre agence."
          icon={UserCheck}
        />
      </>
    );
  } else if (isAgent(user)) {
    const [prospects, clients] = await Promise.all([
      apiFetch<ApiEnvelope<Prospect[]>>("/mobile/myprospects"),
      apiFetch<ApiEnvelope<Client[]>>(`/mobile/clients/agent/${user.id}`),
    ]);

    cards = (
      <>
        <DashboardCard
          href="/agent/prospects"
          label="Mes prospects"
          count={prospects.data.length}
          description="Prospects que vous avez enregistrés."
          icon={UserPlus}
        />
        <DashboardCard
          href="/agent/clients"
          label="Mes clients"
          count={clients.data.length}
          description="Clients issus de vos prospects convertis."
          icon={UserCheck}
        />
      </>
    );
  } else if (hasPermission(user, "view_clients")) {
    const { data: clients } = await apiFetch<ApiEnvelope<Client[]>>(`/clients/agency/${user.agency_id}`);

    cards = (
      <DashboardCard
        href="/clients"
        label="Clients"
        count={clients.length}
        description="Clients de votre agence."
        icon={UserCheck}
      />
    );
  }

  let pendingLoans: Loan[] = [];
  if (hasPermission(user, "approve_loan")) {
    const { data } = await apiFetch<ApiEnvelope<Loan[]>>("/loans/pending-approval");
    pendingLoans = data;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">Bienvenue, {user.first_name}.</p>
      </div>

      {stats || cards ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats && <DashboardStatsGrid stats={stats} />}
          {hasPermission(user, "approve_loan") && (
            <DashboardStatCard
              label="Prêts en attente"
              value={pendingLoans.length}
              description="En attente d'approbation."
              icon={Clock}
            />
          )}
          {cards}
        </div>
      ) : (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Aucun module disponible pour l&apos;instant</CardTitle>
            <CardDescription>Aucun espace n&apos;est encore configuré pour votre rôle.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <PendingLoansTable loans={pendingLoans} showAgencyColumn={isDeveloper(user) || isMicrofinanceOwner(user)} />

      {monthlyStats && <DashboardMonthlyChart stats={monthlyStats} />}
    </div>
  );
}
