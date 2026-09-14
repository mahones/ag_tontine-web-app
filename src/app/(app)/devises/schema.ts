import { z } from "zod";

// Mirrors Store/UpdateCurrencyRequest in ag_tontine (code, name both required strings;
// code is unique).
export const currencyFormSchema = z.object({
  code: z.string().trim().min(1, "Le code est requis.").max(10, "Le code doit contenir au plus 10 caractères."),
  name: z.string().trim().min(1, "Le nom est requis."),
});

export type CurrencyFormValues = z.infer<typeof currencyFormSchema>;
