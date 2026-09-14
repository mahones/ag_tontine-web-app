"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withdrawalGainFormSchema, type WithdrawalGainFormValues } from "./schema";
import type { WithdrawalActionResult } from "./actions";

export function WithdrawalGainForm({
  onSubmit,
}: {
  onSubmit: (values: WithdrawalGainFormValues) => Promise<WithdrawalActionResult>;
}) {
  const [pending, setPending] = useState(false);
  const form = useForm<WithdrawalGainFormValues>({
    resolver: zodResolver(withdrawalGainFormSchema),
  });

  async function handleSubmit(values: WithdrawalGainFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (result.success) {
        toast.success("Prêt soldé et retrait enregistré.");
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
        <Label htmlFor="amount">Montant total à retirer (couvre le gain agence)</Label>
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

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        Solder le prêt et retirer
      </Button>
    </form>
  );
}
