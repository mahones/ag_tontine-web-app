"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import type { ApiEnvelope, Repayment } from "@/lib/types";
import { repaymentCreateFormSchema, type RepaymentCreateFormValues } from "./schema";

export type RepaymentActionResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

export async function createRepaymentAction(
  loanId: string,
  clientId: string,
  notebookId: string,
  values: RepaymentCreateFormValues,
): Promise<RepaymentActionResult> {
  await requirePermission("see_loans");

  const parsed = repaymentCreateFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Repayment>>(`/repayments`, {
      method: "POST",
      body: { loan_id: loanId, ...parsed.data },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath(`/clients/${clientId}/carnets/${notebookId}/prets/${loanId}`);
  return { success: true };
}
