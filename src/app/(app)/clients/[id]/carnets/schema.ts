import { z } from "zod";

// Mirrors StoreNotebookRequest (contribution_amount required decimal min:200).
export const notebookCreateFormSchema = z.object({
  contribution_amount: z
    .number({ error: "La cotisation doit être un nombre." })
    .min(200, "La cotisation minimale est 200."),
});

export type NotebookCreateFormValues = z.infer<typeof notebookCreateFormSchema>;

// UpdateNotebookAction only ever persists "status" despite UpdateNotebookRequest validating
// notebook_number/year/contribution_amount too — so this is the only editable field here.
export const notebookStatusFormSchema = z.object({
  status: z.enum(["active", "completed", "cancelled", "closed"], {
    error: "Le statut est requis.",
  }),
});

export type NotebookStatusFormValues = z.infer<typeof notebookStatusFormSchema>;

export const NOTEBOOK_STATUS_LABELS: Record<NotebookStatusFormValues["status"], string> = {
  active: "Actif",
  completed: "Terminé",
  cancelled: "Annulé",
  closed: "Clôturé",
};
