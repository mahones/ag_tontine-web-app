import { z } from "zod";

// Mirrors StoreClientRequest in ag_tontine: it takes no body fields anymore — identity
// (name/phone/address) AND contribution_amount are both copied server-side from the chosen
// Prospect (CreateClientAction), never re-entered here (a client can't be created for less —
// or more — than the "mise" the prospect already pledged). prospect_id isn't part of the
// request body — it's the {prospect} route segment — but it's a real form field here (the
// prospect picker), so it's still validated.
export const clientCreateFormSchema = z.object({
  prospect_id: z.string().trim().min(1, "Le prospect est requis."),
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
