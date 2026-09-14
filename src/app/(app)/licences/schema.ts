import { z } from "zod";

// Mirrors Store/UpdateLicenceRequest in ag_tontine (microfinance_id required exists,
// start_date/end_date required dates with end >= start, status required enum). licence_key
// is generated server-side (from the microfinance code) and never submitted from here.
export const licenceFormSchema = z
  .object({
    microfinance_id: z.string().trim().min(1, "La microfinance est requise."),
    start_date: z.string().trim().min(1, "La date de début est requise."),
    end_date: z.string().trim().min(1, "La date de fin est requise."),
    status: z.enum(["active", "expired", "revoked"], {
      error: "Le statut est requis.",
    }),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "La date de fin doit être postérieure ou égale à la date de début.",
    path: ["end_date"],
  });

export type LicenceFormValues = z.infer<typeof licenceFormSchema>;

export const LICENCE_STATUS_LABELS: Record<LicenceFormValues["status"], string> = {
  active: "Active",
  expired: "Expirée",
  revoked: "Révoquée",
};
