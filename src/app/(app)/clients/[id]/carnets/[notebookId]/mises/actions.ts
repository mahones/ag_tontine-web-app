"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import type { ApiEnvelope, Notebook } from "@/lib/types";
import { contributionAmountFormSchema, type ContributionAmountFormValues } from "./schema";

export type ContributionAmountActionResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

export async function changeContributionAmountAction(
  notebookId: string,
  clientId: string,
  values: ContributionAmountFormValues,
): Promise<ContributionAmountActionResult> {
  // Matches NotebookPolicy/create_client on the backend: same people who can create a
  // client (Chef Agence/Gestionnaire/Super Admin), not Caissier.
  await requirePermission("create_client");

  const parsed = contributionAmountFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Notebook>>(`/notebooks/${notebookId}/contribution-amount`, {
      method: "PUT",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath(`/clients/${clientId}/carnets/${notebookId}/mises`);
  revalidatePath(`/clients/${clientId}/carnets/${notebookId}`);
  return { success: true };
}
