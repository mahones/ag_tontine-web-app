import { z } from "zod";

// Mirrors AuthController@updateProfile in ag_tontine. current_password is only
// required when phone or email actually changes (enforced in actions.ts, since
// that depends on comparing against the session's current values).
export const profileFormSchema = z.object({
  first_name: z.string().trim().min(1, "Le prénom est requis.").max(255, "255 caractères maximum."),
  last_name: z.string().trim().min(1, "Le nom est requis.").max(255, "255 caractères maximum."),
  phone: z.string().trim().min(1, "Le téléphone est requis."),
  email: z.string().trim().min(1, "L'email est requis.").email("Adresse email invalide."),
  current_password: z.string(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Mirrors AuthController@changePassword.
export const passwordFormSchema = z
  .object({
    current_password: z.string().min(1, "Le mot de passe actuel est requis."),
    new_password: z.string().min(8, "8 caractères minimum."),
    new_password_confirmation: z.string().min(1, "Confirmez le nouveau mot de passe."),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["new_password_confirmation"],
  });

export type PasswordFormValues = z.infer<typeof passwordFormSchema>;
