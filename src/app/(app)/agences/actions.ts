"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/auth";
import type { ApiEnvelope, Agency } from "@/lib/types";
import { agencyFormSchema, type AgencyFormValues } from "./schema";

export type AgencyActionResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

export async function createAgencyAction(
  currencyId: string,
  values: AgencyFormValues,
): Promise<AgencyActionResult> {
  await requireSuperAdmin();

  const parsed = agencyFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Agency>>("/agencies", {
      method: "POST",
      body: { currency_id: currencyId, ...parsed.data },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/agences");
  redirect("/agences");
}

export async function updateAgencyAction(id: string, values: AgencyFormValues): Promise<AgencyActionResult> {
  await requireSuperAdmin();

  const parsed = agencyFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Agency>>(`/agencies/${id}`, {
      method: "PUT",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/agences");
  revalidatePath(`/agences/${id}`);
  redirect("/agences");
}
