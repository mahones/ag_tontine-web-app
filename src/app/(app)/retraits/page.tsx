import { requirePermission } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { isDeveloper, isMicrofinanceOwner } from "@/lib/roles";
import { buildListQuery, currentSearchValue } from "@/lib/list-query";
import type { PaginatedEnvelope, Withdrawal } from "@/lib/types";
import { WithdrawalsTable } from "./withdrawals-table";

export const metadata = {
  title: "Retraits — Tontine",
};

/**
 * All withdrawals of the caller's own agency (Chef Agence/Gestionnaire/Caissier —
 * view_withdrawals holders below Super Admin), every agency of their microfinance
 * (Super Admin), or platform-wide (Développeur) — same three-tier scoping as
 * /prets. hasPermission() always returns true for Développeur (level 0 bypasses
 * every check), so requirePermission("view_withdrawals") lets them through too.
 */
export default async function WithdrawalsListPage(props: PageProps<"/retraits">) {
  const user = await requirePermission("view_withdrawals");

  const searchParams = await props.searchParams;
  const dev = isDeveloper(user);
  const scopedToMicrofinance = isMicrofinanceOwner(user);
  const endpoint = dev ? "/withdrawals" : scopedToMicrofinance ? "/microfinance/withdrawals" : "/agency/withdrawals";
  const { data: withdrawals, meta } = await apiFetch<PaginatedEnvelope<Withdrawal>>(
    `${endpoint}${buildListQuery(searchParams)}`,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Retraits</h1>
        <p className="text-sm text-muted-foreground">
          {dev
            ? "Retraits de toute la plateforme."
            : scopedToMicrofinance
              ? "Retraits des agences de votre microfinance."
              : "Retraits de votre agence."}
        </p>
      </div>

      <WithdrawalsTable
        withdrawals={withdrawals}
        meta={meta}
        initialSearch={currentSearchValue(searchParams)}
        showAgencyColumn={dev || scopedToMicrofinance}
      />
    </div>
  );
}
