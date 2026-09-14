"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import type { ApiEnvelope, Withdrawal } from "@/lib/types";
import {
  withdrawalCreateFormSchema,
  withdrawalGainFormSchema,
  type WithdrawalCreateFormValues,
  type WithdrawalGainFormValues,
} from "./schema";

export type WithdrawalActionResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

export async function createWithdrawalAction(
  notebookId: string,
  clientId: string,
  values: WithdrawalCreateFormValues,
): Promise<WithdrawalActionResult> {
  await requirePermission("validate_withdrawal");

  const parsed = withdrawalCreateFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Withdrawal>>(`/withdrawals/${notebookId}`, {
      method: "POST",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath(`/clients/${clientId}/carnets/${notebookId}/retraits`);
  return { success: true };
}

export async function createWithdrawalOnLoanGainAction(
  notebookId: string,
  clientId: string,
  values: WithdrawalGainFormValues,
): Promise<WithdrawalActionResult> {
  await requirePermission("validate_withdrawal");

  const parsed = withdrawalGainFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Withdrawal>>(`/withdrawalToPayment/${notebookId}`, {
      method: "POST",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath(`/clients/${clientId}/carnets/${notebookId}/retraits`);
  revalidatePath(`/clients/${clientId}/carnets/${notebookId}/prets`);
  return { success: true };
}
