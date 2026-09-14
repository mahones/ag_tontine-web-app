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
import { LOAN_TYPE_LABELS, loanCreateFormSchema, type LoanCreateFormValues } from "./schema";
import type { LoanActionResult } from "./actions";

export function LoanCreateForm({
  onSubmit,
}: {
  onSubmit: (values: LoanCreateFormValues) => Promise<LoanActionResult>;
}) {
  const [pending, setPending] = useState(false);
  const form = useForm<LoanCreateFormValues>({
    resolver: zodResolver(loanCreateFormSchema),
  });

  async function handleSubmit(values: LoanCreateFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (!result.success) {
        if (result.errors?.type_loan) {
          form.setError("type_loan", { message: result.errors.type_loan[0] });
        }
        toast.error(result.message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-xs space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type_loan">Type de prêt</Label>
        <Controller
          control={form.control}
          name="type_loan"
          render={({ field }) => (
            <Select
              items={Object.entries(LOAN_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
              value={field.value || null}
              onValueChange={field.onChange}
              disabled={pending}
            >
              <SelectTrigger id="type_loan" className="w-full">
                <SelectValue placeholder="Sélectionner un type de prêt" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LOAN_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.type_loan && (
          <p className="text-sm text-destructive">{form.formState.errors.type_loan.message}</p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        Soumettre le prêt
      </Button>
    </form>
  );
}
