"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WITHDRAWAL_MODE_LABELS, withdrawalCreateFormSchema, type WithdrawalCreateFormValues } from "./schema";
import type { WithdrawalActionResult } from "./actions";

export function WithdrawalCreateForm({
  onSubmit,
}: {
  onSubmit: (values: WithdrawalCreateFormValues) => Promise<WithdrawalActionResult>;
}) {
  const [pending, setPending] = useState(false);
  const form = useForm<WithdrawalCreateFormValues>({
    resolver: zodResolver(withdrawalCreateFormSchema),
  });

  async function handleSubmit(values: WithdrawalCreateFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (result.success) {
        toast.success("Retrait enregistré.");
        form.reset();
      } else {
        if (result.errors?.amount) {
          form.setError("amount", { message: result.errors.amount[0] });
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
        <Label htmlFor="amount">Montant à retirer</Label>
        <Input
          id="amount"
          type="number"
          min={0}
          step="0.01"
          disabled={pending}
          {...form.register("amount", { valueAsNumber: true })}
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="withdrawal_mode">Mode de retrait</Label>
        <Controller
          control={form.control}
          name="withdrawal_mode"
          render={({ field }) => (
            <Select
              items={Object.entries(WITHDRAWAL_MODE_LABELS).map(([value, label]) => ({ value, label }))}
              value={field.value || null}
              onValueChange={field.onChange}
              disabled={pending}
            >
              <SelectTrigger id="withdrawal_mode" className="w-full">
                <SelectValue placeholder="Sélectionner un mode de retrait" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(WITHDRAWAL_MODE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.withdrawal_mode && (
          <p className="text-sm text-destructive">{form.formState.errors.withdrawal_mode.message}</p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        Enregistrer le retrait
      </Button>
    </form>
  );
}
