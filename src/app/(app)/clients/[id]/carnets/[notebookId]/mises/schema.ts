import { z } from "zod";

// Mirrors ChangeContributionAmountRequest in ag_tontine (required decimal, min 200 — same
// floor as a notebook's own contribution_amount).
export const contributionAmountFormSchema = z.object({
  contribution_amount: z
    .number({ error: "Le montant doit être un nombre." })
    .min(200, "Le montant minimal est 200."),
});

export type ContributionAmountFormValues = z.infer<typeof contributionAmountFormSchema>;
