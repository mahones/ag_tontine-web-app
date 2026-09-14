import { z } from "zod";

// Mirrors Store/UpdateUserRequest in ag_tontine. agency_id/role_id are nullable selects
// (empty string == none, translated to null before hitting the API). Password is required
// on create (min 8) and optional on edit (blank == unchanged) — since both routes share
// this schema, that distinction is enforced in actions.ts rather than here. is_active is
// deliberately not part of this form: it's toggled via the dedicated /users/{id}/toggle
// route instead (see toggle-user-actif-button.tsx).
export const userFormSchema = z.object({
  agency_id: z.string().trim(),
  role_id: z.string().trim(),
  first_name: z.string().trim().min(1, "Le prénom est requis.").max(255, "255 caractères maximum."),
  last_name: z.string().trim().min(1, "Le nom est requis.").max(255, "255 caractères maximum."),
  phone: z.string().trim().min(1, "Le téléphone est requis."),
  email: z.string().trim().min(1, "L'email est requis.").email("Adresse email invalide."),
  password: z.string().refine((value) => value === "" || value.length >= 8, {
    message: "8 caractères minimum.",
  }),
  is_agent: z.boolean(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
