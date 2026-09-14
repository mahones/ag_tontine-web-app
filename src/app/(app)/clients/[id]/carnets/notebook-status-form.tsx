"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NOTEBOOK_STATUS_LABELS, notebookStatusFormSchema, type NotebookStatusFormValues } from "./schema";
import type { NotebookActionResult } from "./actions";

export function NotebookStatusForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues: NotebookStatusFormValues;
  onSubmit: (values: NotebookStatusFormValues) => Promise<NotebookActionResult>;
}) {
  const [pending, setPending] = useState(false);
  const form = useForm<NotebookStatusFormValues>({
    resolver: zodResolver(notebookStatusFormSchema),
    defaultValues,
  });

  async function handleSubmit(values: NotebookStatusFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (result.success) {
        toast.success("Statut mis à jour.");
      } else {
        toast.error(result.message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-xs space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status">Statut</Label>
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <Select
              items={Object.entries(NOTEBOOK_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
              value={field.value || null}
              onValueChange={field.onChange}
              disabled={pending}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NOTEBOOK_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        Enregistrer
      </Button>
    </form>
  );
}
