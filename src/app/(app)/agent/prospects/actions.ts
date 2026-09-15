"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { requireAgent } from "@/lib/auth";
import type { ApiEnvelope, Prospect } from "@/lib/types";
import { prospectFormSchema, type ProspectFormValues } from "./schema";

export type ProspectActionResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

export async function createProspectAction(values: ProspectFormValues): Promise<ProspectActionResult> {
  await requireAgent();

  const parsed = prospectFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Prospect>>("/mobile/createprospect", {
      method: "POST",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/agent/prospects");
  redirect("/agent/prospects");
}

export async function updateProspectAction(id: string, values: ProspectFormValues): Promise<ProspectActionResult> {
  await requireAgent();

  const parsed = prospectFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Prospect>>(`/mobile/prospects/${id}`, {
      method: "PUT",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/agent/prospects");
  revalidatePath(`/agent/prospects/${id}`);
  redirect("/agent/prospects");
}
