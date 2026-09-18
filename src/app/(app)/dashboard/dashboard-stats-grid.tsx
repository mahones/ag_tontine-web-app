import { Banknote, HandCoins, PiggyBank, TriangleAlert, UserPlus } from "lucide-react";
import type { DashboardStats } from "@/lib/types";
import { formatAmount } from "@/lib/format-currency";
import { DashboardStatCard } from "./dashboard-stat-card";

/**
 * The same five financial/operational cards shown on the main dashboard
 * (GetDashboardStatsAction's shape), reused wherever a Développeur drills into
 * one microfinance or one agency and needs the same snapshot scoped to it.
 */
export function DashboardStatsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <>
      <DashboardStatCard
        label="Cotisations ce mois-ci"
        value={stats.cotisations.this_month}
        description={`Cumul : ${formatAmount(stats.cotisations.total)}`}
        icon={PiggyBank}
        isAmount
      />
      <DashboardStatCard
        label="Prêts en cours"
        value={stats.loans.active_count}
        description={`Montant en cours : ${formatAmount(stats.loans.active_amount)}`}
        icon={HandCoins}
        tone="navy"
      />
      <DashboardStatCard
        label="Prêts en retard"
        value={stats.loans.overdue_count}
        description={`Montant estimé en retard : ${formatAmount(stats.loans.overdue_amount)}`}
        icon={TriangleAlert}
        tone="danger"
      />
      <DashboardStatCard
        label="Retraits ce mois-ci"
        value={stats.withdrawals.this_month}
        description={`Cumul : ${formatAmount(stats.withdrawals.total)}`}
        icon={Banknote}
        tone="navy"
        isAmount
      />
      <DashboardStatCard
        label="Nouveaux prospects (7 jours)"
        value={stats.prospects.last_7_days}
        description={`${stats.prospects.pending} en attente de conversion — ${stats.prospects.last_30_days} sur 30 jours.`}
        icon={UserPlus}
        tone="green"
      />
    </>
  );
}
