"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import type { ApiEnvelope, Collection } from "@/lib/types";
import { collectionCreateFormSchema, type CollectionCreateFormValues } from "./schema";

export type CollectionActionResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

export async function createCollectionAction(
  notebookId: string,
  clientId: string,
  values: CollectionCreateFormValues,
): Promise<CollectionActionResult> {
  await requirePermission("register_contribution_agence");

  const parsed = collectionCreateFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Collection>>(`/collections/${notebookId}`, {
      method: "POST",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath(`/clients/${clientId}/carnets/${notebookId}/cotisations`);
  return { success: true };
}
