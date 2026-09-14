import { z } from "zod";

// Mirrors Store/UpdateAgencyRequest in ag_tontine (name, address, phone required strings,
// is_headquarters required boolean). currency_id and microfinance_id are NOT form fields:
// the backend resolves microfinance_id from the caller's own agency for Super Admin, and
// there is no API route exposing the currency list to a Super Admin (only Développeur can
// list/manage currencies) — so new agencies inherit the currency of the caller's own
// (headquarters) agency, resolved server-action-side rather than picked in this form. See
// actions.ts createAgencyAction and agences/nouveau/page.tsx. code_agency is server-generated.
export const agencyFormSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis."),
  address: z.string().trim().min(1, "L'adresse est requise."),
  phone: z.string().trim().min(1, "Le téléphone est requis."),
  is_headquarters: z.boolean(),
});

export type AgencyFormValues = z.infer<typeof agencyFormSchema>;
