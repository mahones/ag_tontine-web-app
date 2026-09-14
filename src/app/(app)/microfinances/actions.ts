"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { requireDeveloper } from "@/lib/auth";
import type { ApiEnvelope, Microfinance } from "@/lib/types";
import { microfinanceFormSchema, type MicrofinanceFormValues } from "./schema";

export type MicrofinanceActionResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

function toPayload(values: MicrofinanceFormValues) {
  return {
    name: values.name,
    country: values.country,
    logo: values.logo || null,
    primary_color: values.primary_color,
    local_server_url: values.local_server_url,
  };
}

export async function createMicrofinanceAction(
  values: MicrofinanceFormValues,
): Promise<MicrofinanceActionResult> {
  await requireDeveloper();

  const parsed = microfinanceFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Microfinance>>("/microfinances", {
      method: "POST",
      body: toPayload(parsed.data),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/microfinances");
  redirect("/microfinances");
}

export async function updateMicrofinanceAction(
  id: string,
  values: MicrofinanceFormValues,
): Promise<MicrofinanceActionResult> {
  await requireDeveloper();

  const parsed = microfinanceFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Microfinance>>(`/microfinances/${id}`, {
      method: "PUT",
      body: toPayload(parsed.data),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/microfinances");
  revalidatePath(`/microfinances/${id}`);
  redirect("/microfinances");
}

export async function deleteMicrofinanceAction(id: string): Promise<MicrofinanceActionResult> {
  await requireDeveloper();

  try {
    await apiFetch<ApiEnvelope<null>>(`/microfinances/${id}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/microfinances");
  return { success: true };
}
