"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { requireDeveloper } from "@/lib/auth";
import type { ApiEnvelope, Configuration } from "@/lib/types";
import { configurationFormSchema, type ConfigurationFormValues } from "./schema";

export type ConfigurationActionResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

function toPayload(values: ConfigurationFormValues) {
  return {
    microfinance_id: values.microfinance_id,
    key: values.key,
    value: values.value,
  };
}

export async function createConfigurationAction(
  values: ConfigurationFormValues,
): Promise<ConfigurationActionResult> {
  await requireDeveloper();

  const parsed = configurationFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Configuration>>("/configurations", {
      method: "POST",
      body: toPayload(parsed.data),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/configurations");
  redirect("/configurations");
}

export async function updateConfigurationAction(
  id: string,
  values: ConfigurationFormValues,
): Promise<ConfigurationActionResult> {
  await requireDeveloper();

  const parsed = configurationFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Configuration>>(`/configurations/${id}`, {
      method: "PUT",
      body: toPayload(parsed.data),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/configurations");
  revalidatePath(`/configurations/${id}`);
  redirect("/configurations");
}

export async function deleteConfigurationAction(id: string): Promise<ConfigurationActionResult> {
  await requireDeveloper();

  try {
    await apiFetch<ApiEnvelope<null>>(`/configurations/${id}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/configurations");
  return { success: true };
}
