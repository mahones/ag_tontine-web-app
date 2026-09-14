import { z } from "zod";

// Mirrors StoreWithdrawalRequest (amount required decimal >= 0, withdrawal_mode optional
// string) — the backend accepts any string for withdrawal_mode ("sometimes|string"), so this
// enum is a client-side-only tightening down to the values WithdrawalMode actually defines.
export const withdrawalCreateFormSchema = z.object({
  amount: z.number({ error: "Le montant doit être un nombre." }).positive("Le montant doit être positif."),
  withdrawal_mode: z.enum(["cash", "bank_transfer", "check", "mobile_money"], {
    error: "Le mode de retrait est requis.",
  }),
});

export type WithdrawalCreateFormValues = z.infer<typeof withdrawalCreateFormSchema>;

export const WITHDRAWAL_MODE_LABELS: Record<WithdrawalCreateFormValues["withdrawal_mode"], string> = {
  cash: "Espèces",
  bank_transfer: "Virement bancaire",
  check: "Chèque",
  mobile_money: "Mobile money",
};

// Mirrors ValidateWithdrawalGainRepaymentRequest (amount required decimal).
export const withdrawalGainFormSchema = z.object({
  amount: z.number({ error: "Le montant doit être un nombre." }).positive("Le montant doit être positif."),
});

export type WithdrawalGainFormValues = z.infer<typeof withdrawalGainFormSchema>;
