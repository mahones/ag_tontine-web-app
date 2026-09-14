import { z } from "zod";

// Mirrors StoreClientRequest in ag_tontine: the only field actually submitted is
// contribution_amount (required, numeric, min 200) — identity fields (name/phone/address)
// are copied server-side from the chosen Prospect (CreateClientAction), not user-entered.
// prospect_id isn't part of the request body — it's the {prospect} route segment — but it's
// a real form field here (the prospect picker), so it's validated alongside the amount.
export const clientCreateFormSchema = z.object({
  prospect_id: z.string().trim().min(1, "Le prospect est requis."),
  contribution_amount: z
    .number({ error: "La cotisation doit être un nombre." })
    .min(200, "La cotisation minimale est 200."),
});

export type ClientCreateFormValues = z.infer<typeof clientCreateFormSchema>;

// Mirrors UpdateClientRequest (all optional/"sometimes", but this form always sends all four).
export const clientEditFormSchema = z.object({
  first_name: z.string().trim().min(1, "Le prénom est requis."),
  last_name: z.string().trim().min(1, "Le nom est requis."),
  phone: z.string().trim().min(1, "Le téléphone est requis."),
  address: z.string().trim().min(1, "L'adresse est requise."),
});

export type ClientEditFormValues = z.infer<typeof clientEditFormSchema>;
