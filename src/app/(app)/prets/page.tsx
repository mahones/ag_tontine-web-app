import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { isCaissier, isDeveloper, isMicrofinanceOwner } from "@/lib/roles";
import { buildListQuery, currentSearchValue } from "@/lib/list-query";
import type { Loan, PaginatedEnvelope } from "@/lib/types";
import { LoansTable, ALL_STATUSES } from "./loans-table";

export const metadata = {
  title: "Prêts — Tontine",
};

/**
 * All loans of the caller's own agency (Chef Agence/Gestionnaire/Caissier — see_loans
 * holders below Super Admin) or every agency of their microfinance (Super Admin).
 * Développeur has no flat, cross-microfinance list of their own — same reasoning as
 * Personnel/Clients (see /personnels, /clients): they reach a carnet's loans by
 * drilling into a microfinance's agencies instead.
 */
export default async function LoansListPage(props: PageProps<"/prets">) {
  const user = await requireUser();
  if (isDeveloper(user)) redirect("/microfinances");
  if (!hasPermission(user, "see_loans")) redirect("/dashboard");

  const searchParams = await props.searchParams;
  const statusParam = searchParams.status;
  const explicitStatus = Array.isArray(statusParam) ? statusParam[0] : statusParam;
  // Caissier can't approve/reject — "Approuvé" (ready for disbursement/repayment) is
  // their actionable default. Chef Agence/Gestionnaire/Super Admin default to "En
  // attente" instead, since that's the worklist an approver needs. Only applies until
  // the caller picks something else via the filter (which always sets an explicit
  // ?status=, including "all" — see loans-table.tsx).
  const defaultStatus = isCaissier(user) ? "approved" : "pending";
  const status = explicitStatus ?? defaultStatus;
  const scopedToMicrofinance = isMicrofinanceOwner(user);
  const canApprove = hasPermission(user, "approve_loan");
  const endpoint = scopedToMicrofinance ? "/microfinance/loans" : "/agency/loans";
  const query = buildListQuery(searchParams) + (status === ALL_STATUSES ? "" : `&status=${encodeURIComponent(status)}`);
  const { data: loans, meta } = await apiFetch<PaginatedEnvelope<Loan>>(`${endpoint}${query}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prêts</h1>
        <p className="text-sm text-muted-foreground">
          {scopedToMicrofinance
            ? "Prêts des agences de votre microfinance."
            : "Prêts de votre agence."}
        </p>
      </div>

      <LoansTable
        loans={loans}
        meta={meta}
        initialSearch={currentSearchValue(searchParams)}
        initialStatus={status}
        showAgencyColumn={scopedToMicrofinance}
        canApprove={canApprove}
      />
    </div>
  );
}
