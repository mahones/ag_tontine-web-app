import { z } from "zod";

// Mirrors Store/UpdateConfigurationRequest in ag_tontine (microfinance_id required exists,
// key required unique string, value required string).
export const configurationFormSchema = z.object({
  microfinance_id: z.string().trim().min(1, "La microfinance est requise."),
  key: z.string().trim().min(1, "La clé est requise."),
  value: z.string().trim().min(1, "La valeur est requise."),
});

export type ConfigurationFormValues = z.infer<typeof configurationFormSchema>;
