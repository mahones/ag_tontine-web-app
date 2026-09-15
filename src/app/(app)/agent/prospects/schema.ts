import { z } from "zod";

// Mirrors Store/UpdateProspectRequest in ag_tontine. agency_id/agent_id/status are resolved
// server-side (CreateProspectAction assigns the caller's own agency/id, status defaults to
// "pending") — not form fields for an Agent, who only ever creates their own prospects.
export const prospectFormSchema = z.object({
  first_name: z.string().trim().min(1, "Le prénom est requis."),
  last_name: z.string().trim().min(1, "Le nom est requis."),
  phone: z.string().trim().min(1, "Le téléphone est requis."),
  address: z.string().trim().min(1, "L'adresse est requise."),
  id_piece: z.string().trim().optional(),
  contribution_amount: z
    .number({ error: "La cotisation prévue doit être un nombre." })
    .min(0, "La cotisation prévue doit être positive ou nulle."),
});

export type ProspectFormValues = z.infer<typeof prospectFormSchema>;
