"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import type { ApiEnvelope, Client } from "@/lib/types";
import {
  clientCreateFormSchema,
  clientEditFormSchema,
  type ClientCreateFormValues,
  type ClientEditFormValues,
} from "./schema";

export type ClientActionResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

export async function createClientAction(values: ClientCreateFormValues): Promise<ClientActionResult> {
  await requirePermission("create_client");

  const parsed = clientCreateFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Client>>(`/clients/${parsed.data.prospect_id}`, {
      method: "POST",
      body: { contribution_amount: parsed.data.contribution_amount },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/clients");
  redirect("/clients");
}

export async function updateClientAction(id: string, values: ClientEditFormValues): Promise<ClientActionResult> {
  await requirePermission("view_clients");

  const parsed = clientEditFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Client>>(`/clients/${id}`, {
      method: "PUT",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  return { success: true };
}
