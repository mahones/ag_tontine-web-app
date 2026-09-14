"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import type { ApiEnvelope, Notebook } from "@/lib/types";
import {
  notebookCreateFormSchema,
  notebookStatusFormSchema,
  type NotebookCreateFormValues,
  type NotebookStatusFormValues,
} from "./schema";

export type NotebookActionResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

export async function createNotebookAction(
  clientId: string,
  values: NotebookCreateFormValues,
): Promise<NotebookActionResult> {
  await requirePermission("create_notebook");

  const parsed = notebookCreateFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Notebook>>(`/notebooks/${clientId}`, {
      method: "POST",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

export async function updateNotebookStatusAction(
  notebookId: string,
  clientId: string,
  values: NotebookStatusFormValues,
): Promise<NotebookActionResult> {
  await requirePermission("create_notebook");

  const parsed = notebookStatusFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Champs invalides.", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<ApiEnvelope<Notebook>>(`/notebooks/${notebookId}`, {
      method: "PUT",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message, errors: error.errors };
    }
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/carnets/${notebookId}`);
  return { success: true };
}
