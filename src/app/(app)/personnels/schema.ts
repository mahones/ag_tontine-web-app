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

// Mirrors UpdateManagedUserRequest in ag_tontine: the safe subset a Super Admin /
// Chef Agence may edit on their own staff — no role_id, agency_id, is_active or
// password (those stay developer-only, or go through the dedicated reset-password flow).
export const managedUserFormSchema = z.object({
  first_name: z.string().trim().min(1, "Le prénom est requis.").max(255, "255 caractères maximum."),
  last_name: z.string().trim().min(1, "Le nom est requis.").max(255, "255 caractères maximum."),
  phone: z.string().trim().min(1, "Le téléphone est requis."),
  email: z.string().trim().min(1, "L'email est requis.").email("Adresse email invalide."),
  is_agent: z.boolean(),
});

export type ManagedUserFormValues = z.infer<typeof managedUserFormSchema>;

// Mirrors StoreAgencyUserRequest in ag_tontine: registering staff for the caller's
// own agency. No agency_id (forced server-side to the caller's own); role_id is
// required and must be one of the roles /agency/roles returns for this caller.
export const createManagedUserFormSchema = z.object({
  role_id: z.string().trim().min(1, "Le rôle est requis."),
  first_name: z.string().trim().min(1, "Le prénom est requis.").max(255, "255 caractères maximum."),
  last_name: z.string().trim().min(1, "Le nom est requis.").max(255, "255 caractères maximum."),
  phone: z.string().trim().min(1, "Le téléphone est requis."),
  email: z.string().trim().min(1, "L'email est requis.").email("Adresse email invalide."),
  password: z.string().min(8, "8 caractères minimum."),
  is_agent: z.boolean(),
});

export type CreateManagedUserFormValues = z.infer<typeof createManagedUserFormSchema>;

// Mirrors StoreMicrofinanceUserRequest in ag_tontine: a Super Admin registering
// staff anywhere in their own microfinance — same as createManagedUserFormSchema
// plus a required agency_id (the caller picks which of their microfinance's
// agencies the new account belongs to).
export const createMicrofinanceUserFormSchema = createManagedUserFormSchema.extend({
  agency_id: z.string().trim().min(1, "L'agence est requise."),
});

export type CreateMicrofinanceUserFormValues = z.infer<typeof createMicrofinanceUserFormSchema>;
