"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import type { ApiEnvelope, Loan } from "@/lib/types";
import {
  loanCreateFormSchema,
  loanStatusFormSchema,
  type LoanCreateFormValues,
  type LoanStatusFormValues,
} from "./schema";

export type LoanActionResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

export async function createLoanAction(
  notebookId: string,
  clientId: string,
  values: LoanCreateFormValues,
): Promise<LoanActionResult> {
  await requirePermission("submit_loan");

  const parsed = loanCreateFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Loan>>(`/loans/${notebookId}`, {
      method: "POST",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath(`/clients/${clientId}/carnets/${notebookId}/prets`);
  redirect(`/clients/${clientId}/carnets/${notebookId}/prets`);
}

export async function updateLoanStatusAction(
  loanId: string,
  clientId: string,
  notebookId: string,
  values: LoanStatusFormValues,
): Promise<LoanActionResult> {
  await requirePermission("approve_loan");

  const parsed = loanStatusFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Loan>>(`/loans/${loanId}`, {
      method: "PUT",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath(`/clients/${clientId}/carnets/${notebookId}/prets`);
  revalidatePath(`/clients/${clientId}/carnets/${notebookId}/prets/${loanId}`);
  return { success: true };
}
