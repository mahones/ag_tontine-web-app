import { z } from "zod";

// Mirrors Store/UpdateRoleRequest in ag_tontine (name required unique max:255,
// level required integer min:0).
export const roleFormSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis.").max(255, "255 caractères maximum."),
  level: z
    .number({ error: "Le niveau doit être un nombre." })
    .int("Doit être un entier.")
    .min(0, "Le niveau minimum est 0."),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
