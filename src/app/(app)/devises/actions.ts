"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { requireDeveloper } from "@/lib/auth";
import type { ApiEnvelope, Currency } from "@/lib/types";
import { currencyFormSchema, type CurrencyFormValues } from "./schema";

export type CurrencyActionResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

function toPayload(values: CurrencyFormValues) {
  return {
    code: values.code,
    name: values.name,
  };
}

export async function createCurrencyAction(values: CurrencyFormValues): Promise<CurrencyActionResult> {
  await requireDeveloper();

  const parsed = currencyFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Currency>>("/currencies", {
      method: "POST",
      body: toPayload(parsed.data),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/devises");
  redirect("/devises");
}

export async function updateCurrencyAction(
  id: string,
  values: CurrencyFormValues,
): Promise<CurrencyActionResult> {
  await requireDeveloper();

  const parsed = currencyFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Currency>>(`/currencies/${id}`, {
      method: "PUT",
      body: toPayload(parsed.data),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/devises");
  revalidatePath(`/devises/${id}`);
  redirect("/devises");
}

export async function deleteCurrencyAction(id: string): Promise<CurrencyActionResult> {
  await requireDeveloper();

  try {
    await apiFetch<ApiEnvelope<null>>(`/currencies/${id}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/devises");
  return { success: true };
}
