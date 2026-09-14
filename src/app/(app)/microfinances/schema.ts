import { z } from "zod";

// Mirrors Store/UpdateMicrofinanceRequest in ag_tontine (name, country, primary_color,
// local_server_url required; logo optional). "code" is generated server-side and never
// submitted from here.
export const microfinanceFormSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères."),
  country: z.string().trim().min(2, "Le pays est requis."),
  logo: z
    .string()
    .trim()
    .url("Doit être une URL valide.")
    .optional()
    .or(z.literal("")),
  primary_color: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Couleur hexadécimale invalide (ex: #1E3A8A)."),
  local_server_url: z.string().trim().min(1, "L'URL du serveur local est requise."),
});

export type MicrofinanceFormValues = z.infer<typeof microfinanceFormSchema>;
