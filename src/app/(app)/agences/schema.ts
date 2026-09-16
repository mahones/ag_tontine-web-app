import { z } from "zod";

// Mirrors Store/UpdateAgencyRequest in ag_tontine (name, address, phone required strings,
// is_headquarters required boolean). microfinance_id is NOT a form field: the backend
// resolves it from the caller's own agency for Super Admin. currency_id IS a form field,
// but only shown/editable at creation (see agence-form.tsx) — UpdateAgencyRequest doesn't
// accept it at all, so the edit form just carries the agency's existing currency through
// as a hidden default to keep this one schema valid for both create and edit.
// code_agency is server-generated.
export const agencyFormSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis."),
  address: z.string().trim().min(1, "L'adresse est requise."),
  phone: z.string().trim().min(1, "Le téléphone est requis."),
  is_headquarters: z.boolean(),
  currency_id: z.string().trim().min(1, "La devise est requise."),
});

export type AgencyFormValues = z.infer<typeof agencyFormSchema>;
