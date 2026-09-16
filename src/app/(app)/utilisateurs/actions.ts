"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { requireDeveloper, requirePermission } from "@/lib/auth";
import { isMicrofinanceOwner } from "@/lib/roles";
import type { ApiEnvelope, ManagedUser } from "@/lib/types";
import {
  userFormSchema,
  type UserFormValues,
  managedUserFormSchema,
  type ManagedUserFormValues,
  createManagedUserFormSchema,
  type CreateManagedUserFormValues,
  createMicrofinanceUserFormSchema,
  type CreateMicrofinanceUserFormValues,
} from "./schema";

export type UserActionResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

function toPayload(values: UserFormValues, { includePassword }: { includePassword: boolean }) {
  return {
    agency_id: values.agency_id || null,
    role_id: values.role_id || null,
    first_name: values.first_name,
    last_name: values.last_name,
    phone: values.phone,
    email: values.email,
    is_agent: values.is_agent,
    ...(includePassword ? { password: values.password } : {}),
  };
}

export async function createUserAction(values: UserFormValues): Promise<UserActionResult> {
  await requireDeveloper();

  const parsed = userFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }
  if (!parsed.data.password) {
    return {
      success: false,
      message: "Le mot de passe est requis.",
      errors: { password: ["Le mot de passe est requis."] },
    };
  }

  try {
    await apiFetch<ApiEnvelope<ManagedUser>>("/users", {
      method: "POST",
      body: toPayload(parsed.data, { includePassword: true }),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/utilisateurs");
  redirect("/utilisateurs");
}

export async function updateUserAction(
  id: string,
  redirectTo: string,
  values: UserFormValues,
): Promise<UserActionResult> {
  await requireDeveloper();

  const parsed = userFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<ManagedUser>>(`/users/${id}`, {
      method: "PUT",
      body: toPayload(parsed.data, { includePassword: parsed.data.password !== "" }),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/utilisateurs");
  revalidatePath(`/utilisateurs/${id}`);
  revalidatePath(redirectTo);
  redirect(redirectTo);
}

/**
 * Chef Agence (and a Super Admin choosing to stay within their own agency)
 * registering staff for that single agency — this is the platform's only
 * account-creation path for those roles (no self-service sign-up page).
 * Always POSTs to /agency/users: CreateUserAction forces agency_id to the
 * caller's own agency for any non-developer caller (see StoreAgencyUserRequest).
 * A Super Admin who needs to pick a different agency of their microfinance uses
 * createMicrofinanceUserAction instead.
 */
export async function createManagedUserAction(values: CreateManagedUserFormValues): Promise<UserActionResult> {
  await requirePermission("manage_users");

  const parsed = createManagedUserFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<ManagedUser>>("/agency/users", {
      method: "POST",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/utilisateurs");
  redirect("/utilisateurs");
}

/**
 * Super Admin registering staff anywhere in their own microfinance (see
 * StoreMicrofinanceUserRequest in ag_tontine for the agency/hierarchy checks).
 */
export async function createMicrofinanceUserAction(
  values: CreateMicrofinanceUserFormValues,
): Promise<UserActionResult> {
  await requirePermission("manage_users");

  const parsed = createMicrofinanceUserFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<ManagedUser>>("/microfinance/users", {
      method: "POST",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/utilisateurs");
  redirect("/utilisateurs");
}

/**
 * Super Admin / Chef Agence editing one of their own staff (see UpdateManagedUserRequest
 * in ag_tontine for the exact field set and hierarchy/scope rules the backend enforces).
 */
export async function updateManagedUserAction(id: string, values: ManagedUserFormValues): Promise<UserActionResult> {
  const user = await requirePermission("manage_users");

  const parsed = managedUserFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  const endpoint = isMicrofinanceOwner(user) ? `/microfinance/users/${id}` : `/agency/users/${id}`;

  try {
    await apiFetch<ApiEnvelope<ManagedUser>>(endpoint, {
      method: "PUT",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/utilisateurs");
  revalidatePath(`/utilisateurs/${id}`);
  redirect("/utilisateurs");
}

export async function deleteUserAction(id: string): Promise<UserActionResult> {
  await requireDeveloper();

  try {
    await apiFetch<ApiEnvelope<null>>(`/users/${id}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/utilisateurs");
  return { success: true };
}

export async function toggleUserActifAction(id: string): Promise<UserActionResult> {
  await requireDeveloper();

  try {
    await apiFetch<ApiEnvelope<ManagedUser>>(`/users/${id}/toggle`, { method: "PATCH" });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/utilisateurs");
  return { success: true };
}
