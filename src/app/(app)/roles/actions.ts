"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { requireDeveloper } from "@/lib/auth";
import type { ApiEnvelope, Role } from "@/lib/types";
import { roleFormSchema, type RoleFormValues } from "./schema";

export type RoleActionResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

function toPayload(values: RoleFormValues) {
  return {
    name: values.name,
    level: values.level,
  };
}

export async function createRoleAction(values: RoleFormValues): Promise<RoleActionResult> {
  await requireDeveloper();

  const parsed = roleFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Role>>("/roles", {
      method: "POST",
      body: toPayload(parsed.data),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/roles");
  redirect("/roles");
}

export async function updateRoleAction(id: string, values: RoleFormValues): Promise<RoleActionResult> {
  await requireDeveloper();

  const parsed = roleFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Role>>(`/roles/${id}`, {
      method: "PUT",
      body: toPayload(parsed.data),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/roles");
  revalidatePath(`/roles/${id}`);
  redirect("/roles");
}

export async function deleteRoleAction(id: string): Promise<RoleActionResult> {
  await requireDeveloper();

  try {
    await apiFetch<ApiEnvelope<null>>(`/roles/${id}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/roles");
  return { success: true };
}
