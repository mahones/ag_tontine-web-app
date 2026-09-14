"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { requireDeveloper } from "@/lib/auth";
import type { ApiEnvelope, Licence } from "@/lib/types";
import { licenceFormSchema, type LicenceFormValues } from "./schema";

export type LicenceActionResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

function toPayload(values: LicenceFormValues) {
  return {
    microfinance_id: values.microfinance_id,
    start_date: values.start_date,
    end_date: values.end_date,
    status: values.status,
  };
}

export async function createLicenceAction(values: LicenceFormValues): Promise<LicenceActionResult> {
  await requireDeveloper();

  const parsed = licenceFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Licence>>("/licences", {
      method: "POST",
      body: toPayload(parsed.data),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/licences");
  redirect("/licences");
}

export async function updateLicenceAction(
  id: string,
  values: LicenceFormValues,
): Promise<LicenceActionResult> {
  await requireDeveloper();

  const parsed = licenceFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Licence>>(`/licences/${id}`, {
      method: "PUT",
      body: toPayload(parsed.data),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/licences");
  revalidatePath(`/licences/${id}`);
  redirect("/licences");
}

export async function deleteLicenceAction(id: string): Promise<LicenceActionResult> {
  await requireDeveloper();

  try {
    await apiFetch<ApiEnvelope<null>>(`/licences/${id}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/licences");
  return { success: true };
}
