"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { repaymentCreateFormSchema, type RepaymentCreateFormValues } from "./schema";
import type { RepaymentActionResult } from "./actions";

export function RepaymentCreateForm({
  onSubmit,
}: {
  onSubmit: (values: RepaymentCreateFormValues) => Promise<RepaymentActionResult>;
}) {
  const [pending, setPending] = useState(false);
  const form = useForm<RepaymentCreateFormValues>({
    resolver: zodResolver(repaymentCreateFormSchema),
  });

  async function handleSubmit(values: RepaymentCreateFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (result.success) {
        toast.success("Remboursement enregistré.");
        form.reset();
      } else {
        if (result.errors?.amount_paid) {
          form.setError("amount_paid", { message: result.errors.amount_paid[0] });
        }
        toast.error(result.message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount_paid">Montant remboursé</Label>
        <Input
          id="amount_paid"
          type="number"
          min={0}
          step="0.01"
          disabled={pending}
          {...form.register("amount_paid", { valueAsNumber: true })}
        />
        {form.formState.errors.amount_paid && (
          <p className="text-sm text-destructive">{form.formState.errors.amount_paid.message}</p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        Enregistrer le remboursement
      </Button>
    </form>
  );
}
