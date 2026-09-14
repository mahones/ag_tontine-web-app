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
  microfinance?: Microfinance;
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
