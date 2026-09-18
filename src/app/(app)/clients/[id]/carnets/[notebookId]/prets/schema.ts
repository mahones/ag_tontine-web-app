import { z } from "zod";

// Mirrors StoreLoanRequest (type_loan required string) — CreateLoanAction throws a raw
// exception for any value outside these three, so the enum keeps that path unreachable
// from this form.
export const loanCreateFormSchema = z.object({
  type_loan: z.enum(["quinzaine", "mensuel", "trimestriel"], {
    error: "Le type de prêt est requis.",
  }),
});

export type LoanCreateFormValues = z.infer<typeof loanCreateFormSchema>;

export const LOAN_TYPE_LABELS: Record<LoanCreateFormValues["type_loan"], string> = {
  quinzaine: "Quinzaine",
  mensuel: "Mensuel",
  trimestriel: "Trimestriel",
};

// UpdateLoanAction persists whatever string is sent as "status" (UpdateLoanRequest only
// validates it's a string) — this form restricts the choices to the transitions an
// approver would actually make by hand. "pending" (initial state), "gains_remaining" and
// "closed" are deliberately excluded: those are meant to be set automatically by
// CreateCollectionAction's repayment logic and the withdrawal-on-loan-gain flow, not
// picked manually here.
export const loanStatusFormSchema = z.object({
  status: z.enum(["approved", "active", "rejected"], {
    error: "Le statut est requis.",
  }),
});

export type LoanStatusFormValues = z.infer<typeof loanStatusFormSchema>;

export const LOAN_STATUS_LABELS: Record<
  "pending" | "approved" | "active" | "gains_remaining" | "closed" | "rejected",
  string
> = {
  pending: "En attente",
  approved: "Approuvé",
  active: "Actif",
  gains_remaining: "Solde de gains restant",
  closed: "Clôturé",
  rejected: "Rejeté",
};

export const LOAN_STATUS_BADGE_VARIANT: Record<
  keyof typeof LOAN_STATUS_LABELS,
  "warning" | "success" | "destructive" | "secondary"
> = {
  pending: "warning",
  approved: "secondary",
  active: "success",
  gains_remaining: "secondary",
  closed: "destructive",
  rejected: "destructive",
};
