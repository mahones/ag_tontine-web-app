"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { updateSessionUser, deleteSession } from "@/lib/session";
import type { AuthUser } from "@/lib/types";
import {
  profileFormSchema,
  type ProfileFormValues,
  passwordFormSchema,
  type PasswordFormValues,
} from "./schema";

export type ProfileActionResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

/**
 * Self-service edit of the caller's own name/phone/email. Phone and email double as
 * the login identifier, so — mirroring AuthController@updateProfile — they're only
 * sent (and current_password only required) when actually changed; an unchanged
 * resubmit of the form never asks for the password again.
 */
export async function updateProfileAction(values: ProfileFormValues): Promise<ProfileActionResult> {
  const currentUser = await requireUser();

  const parsed = profileFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  const { current_password, phone, email, first_name, last_name } = parsed.data;
  const phoneChanged = phone !== currentUser.phone;
  const emailChanged = email !== currentUser.email;

  if ((phoneChanged || emailChanged) && !current_password) {
    return {
      success: false,
      message: "Le mot de passe actuel est requis pour modifier le téléphone ou l'email.",
      errors: { current_password: ["Le mot de passe actuel est requis."] },
    };
  }

  const payload: Record<string, string> = { first_name, last_name };
  if (phoneChanged) payload.phone = phone;
  if (emailChanged) payload.email = email;
  if (phoneChanged || emailChanged) payload.current_password = current_password;

  let response: { user: AuthUser };
  try {
    response = await apiFetch<{ user: AuthUser }>("/auth/me", { method: "PUT", body: payload });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  await updateSessionUser(response.user);
  revalidatePath("/profil");
  return { success: true };
}

/** Changes the caller's own password. The API revokes every token on success, so we drop the local session and send them back to the login screen. */
export async function changePasswordAction(values: PasswordFormValues): Promise<ProfileActionResult> {
  await requireUser();

  const parsed = passwordFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  await deleteSession();
  redirect("/");
}
