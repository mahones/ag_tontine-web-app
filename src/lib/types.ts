/**
 * Shapes mirror the JSON returned by ag_tontine's Http\Resources classes.
 * Every list/detail endpoint wraps its payload as ApiEnvelope<T>.
 */
export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

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
};

export type Client = {
  id: string;
  agency_id: string;
  prospect_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
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
  status: "active" | "completed" | "cancelled" | "closed";
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
  loan_date: string;
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
  synced: boolean;
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
