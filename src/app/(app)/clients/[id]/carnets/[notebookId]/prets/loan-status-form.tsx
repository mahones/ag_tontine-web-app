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
import { LOAN_STATUS_LABELS, loanStatusFormSchema, type LoanStatusFormValues } from "./schema";
import type { LoanActionResult } from "./actions";

const SELECTABLE_STATUSES = loanStatusFormSchema.shape.status.options;

export function LoanStatusForm({
  onSubmit,
}: {
  onSubmit: (values: LoanStatusFormValues) => Promise<LoanActionResult>;
}) {
  const [pending, setPending] = useState(false);
  const form = useForm<LoanStatusFormValues>({
    resolver: zodResolver(loanStatusFormSchema),
  });

  async function handleSubmit(values: LoanStatusFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (result.success) {
        toast.success("Statut du prêt mis à jour.");
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
        <Label htmlFor="status">Nouveau statut</Label>
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <Select
              items={SELECTABLE_STATUSES.map((value) => ({ value, label: LOAN_STATUS_LABELS[value] }))}
              value={field.value || null}
              onValueChange={field.onChange}
              disabled={pending}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {SELECTABLE_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {LOAN_STATUS_LABELS[value]}
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
