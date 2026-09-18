/**
 * Shapes mirror the JSON returned by ag_tontine's Http\Resources classes.
 * Every list/detail endpoint wraps its payload as ApiEnvelope<T>.
 */
export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

/** Same envelope as a paginated list endpoint (`?page=`/`?per_page=`/`?search=`). */
export type PaginatedEnvelope<T> = ApiEnvelope<T[]> & { meta: PaginationMeta };

export type Role = {
  id: string;
  name: string;
  level: number;
};

export type Microfinance = {
  id: string;
  code: string;
  name: string;
  country: string;
  logo: string | null;
  primary_color: string;
  local_server_url: string;
  statut?: string | null;
  created_at: string;
  updated_at: string;
};

export type Agency = {
  id: string;
  code_agency: string;
  name: string;
  address: string;
  phone: string;
  is_headquarters: boolean;
  currency?: Currency;
  microfinance?: Microfinance;
  created_at: string;
  updated_at: string;
};

export type Currency = {
  id: string;
  code: string;
  name: string;
};

export type Prospect = {
  id: string;
  agency_id: string;
  agent_id: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  id_piece: string;
  contribution_amount: string;
  status: "pending" | "approved" | "rejected" | "converted";
  agent?: ManagedUser | null;
};

// Mirrors GetDashboardStatsAction in ag_tontine. Scoped server-side to the
// caller's agency/microfinance/platform depending on role; only reachable by
// Développeur, Super Admin and Chef Agence (permission:view_agency_reports).
export type DashboardStats = {
  cotisations: { total: number; this_month: number };
  loans: { active_amount: number; active_count: number; overdue_amount: number; overdue_count: number };
  withdrawals: { total: number; this_month: number };
  prospects: { pending: number; last_7_days: number; last_30_days: number };
};

/** Mirrors GetMonthlyStatsAction — 12 entries per series, January first. */
export type DashboardMonthlyStats = {
  year: number;
  cotisations: number[];
  loans: number[];
};

export type Client = {
  id: string;
  agency_id: string;
  prospect_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  agents?: ManagedUser[];
  created_at: string;
  updated_at: string;
};

export type Notebook = {
  id: string;
  agency_id: string;
  client_id: string;
  notebook_number: string;
  year: number;
  contribution_amount: string;
  pending_contribution_amount: string | null;
  status: "active" | "completed" | "cancelled" | "closed";
  created_at: string;
  updated_at: string;
};

export type NotebookState = {
  agency_name: string;
  total_amount_collected: string;
  total_boxes: number;
  agency_boxes: number;
  months_count: number;
  months_remaining: number;
};

// Mirrors ShowClientStatsAction in ag_tontine — aggregated across all of the
// client's notebooks.
export type ClientStats = {
  available_balance: string;
  withdrawals: { count: number; total: string };
  loans: { count: number; total: string };
};

export type MonthlyContribution = {
  id: string;
  notebook_id: string;
  month: number;
  amount: string;
  created_at: string;
  updated_at: string;
};

export type Loan = {
  id: string;
  agency_id: string;
  notebook_id: string;
  validator_id: string;
  type_loan: "quinzaine" | "mensuel" | "trimestriel";
  amount_loaned: string;
  file_fees: string;
  agency_gain: string;
  status: "pending" | "approved" | "active" | "gains_remaining" | "closed" | "rejected";
  disbursed_at: string | null;
  disbursed_by: string | null;
  loan_date: string;
  created_at: string;
  updated_at: string;
  // Only present when the backend eager-loads it (e.g. GET /loans/pending-approval).
  notebook?: {
    id: string;
    notebook_number: string;
    client: { id: string; first_name: string; last_name: string } | null;
    agency: { id: string; name: string } | null;
  };
};

export type Withdrawal = {
  id: string;
  agency_id: string;
  notebook_id: string;
  validator_id: string;
  amount: string;
  agency_gain: string | null;
  withdrawal_mode: string;
  validator?: ManagedUser;
  created_at: string;
  updated_at: string;
};

export type Repayment = {
  id: string;
  loan_id: string;
  amount_paid: string;
  created_at: string;
  updated_at: string;
};

export type Collection = {
  id: string;
  agency_id: string;
  notebook_id: string;
  user_id: string;
  box_number: number;
  agency_box: boolean;
  repayment_made: boolean;
  amount: string;
  user?: ManagedUser;
  created_at: string;
  updated_at: string;
};

export type Configuration = {
  id: string;
  microfinance_id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
};

export type Licence = {
  id: string;
  microfinance_id: string;
  licence_key: string;
  start_date: string;
  end_date: string;
  status: "active" | "expired" | "revoked";
  created_at: string;
  updated_at: string;
};

export type ManagedUser = {
  id: string;
  agency_id: string | null;
  role_id: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  is_active: boolean;
  is_agent: boolean;
  agency?: Agency | null;
  role?: Role | null;
  created_at: string;
  updated_at: string;
};

export type AuthUser = {
  id: string;
  agency_id: string | null;
  role_id: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  is_active: boolean;
  is_agent: boolean;
  role: Role | null;
  agency?: Agency | null;
};

/**
 * GET /agency/sync-status (SyncOutboxController) — always scoped to the caller's own
 * agency (see ag_tontine/app/Actions/Sync/GetAgencySyncStatusAction.php). `local_instance`
 * is null when this instance was never provisioned as a local server (MOBILE.md §2) —
 * always the case on the cloud, where `deployment_mode` is "cloud" and every count is 0.
 */
export type SyncOutboxConflict = {
  id: string;
  entity_type: string;
  entity_id: string;
  reason: string | null;
  attempt_count: number;
  created_at: string;
};

export type SyncStatus = {
  deployment_mode: "cloud" | "local";
  local_instance: {
    last_push_at: string | null;
    last_reference_pull_at: string | null;
    cloud_base_url: string | null;
  } | null;
  outbox_counts: {
    pending: number;
    in_flight: number;
    applied: number;
    failed: number;
    discarded: number;
  };
  conflicts: SyncOutboxConflict[];
};
