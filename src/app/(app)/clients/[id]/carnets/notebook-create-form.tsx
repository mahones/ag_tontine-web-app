"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notebookCreateFormSchema, type NotebookCreateFormValues } from "./schema";
import type { NotebookActionResult } from "./actions";

export function NotebookCreateForm({
  onSubmit,
}: {
  onSubmit: (values: NotebookCreateFormValues) => Promise<NotebookActionResult>;
}) {
  const [pending, setPending] = useState(false);
  const form = useForm<NotebookCreateFormValues>({
    resolver: zodResolver(notebookCreateFormSchema),
  });

  async function handleSubmit(values: NotebookCreateFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (!result.success) {
        if (result.errors?.contribution_amount) {
          form.setError("contribution_amount", { message: result.errors.contribution_amount[0] });
        }
        toast.error(result.message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contribution_amount">Cotisation mensuelle</Label>
        <Input
          id="contribution_amount"
          type="number"
          min={200}
          step="0.01"
          disabled={pending}
          {...form.register("contribution_amount", { valueAsNumber: true })}
        />
        {form.formState.errors.contribution_amount && (
          <p className="text-sm text-destructive">{form.formState.errors.contribution_amount.message}</p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        Créer le carnet
      </Button>
    </form>
  );
}
