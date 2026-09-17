"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import { requirePermission } from "@/lib/auth";

export type SyncOutboxActionResult = { success: true } | { success: false; message: string };

export async function retrySyncOutboxItemAction(id: string): Promise<SyncOutboxActionResult> {
  await requirePermission("manage_users");

  try {
    await apiFetch(`/agency/sync-status/${id}/retry`, { method: "POST" });
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/synchronisation");
  return { success: true };
}

export async function discardSyncOutboxItemAction(id: string): Promise<SyncOutboxActionResult> {
  await requirePermission("manage_users");

  try {
    await apiFetch(`/agency/sync-status/${id}/discard`, { method: "POST" });
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    return { success: false, message: "Une erreur est survenue." };
  }

  revalidatePath("/synchronisation");
  return { success: true };
}
