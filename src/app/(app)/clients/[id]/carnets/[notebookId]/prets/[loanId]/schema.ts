import { z } from "zod";

// Mirrors StoreRepaymentRequest (amount_paid required decimal >= 0). loan_id is bound from
// the route, not user input.
export const repaymentCreateFormSchema = z.object({
  amount_paid: z.number({ error: "Le montant doit être un nombre." }).positive("Le montant doit être positif."),
});

export type RepaymentCreateFormValues = z.infer<typeof repaymentCreateFormSchema>;
