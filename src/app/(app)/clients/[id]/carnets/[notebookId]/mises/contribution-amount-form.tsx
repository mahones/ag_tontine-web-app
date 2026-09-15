"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contributionAmountFormSchema, type ContributionAmountFormValues } from "./schema";
import type { ContributionAmountActionResult } from "./actions";

export function ContributionAmountForm({
  onSubmit,
}: {
  onSubmit: (values: ContributionAmountFormValues) => Promise<ContributionAmountActionResult>;
}) {
  const [pending, setPending] = useState(false);
  const form = useForm<ContributionAmountFormValues>({
    resolver: zodResolver(contributionAmountFormSchema),
  });

  async function handleSubmit(values: ContributionAmountFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (result.success) {
        toast.success("Nouvelle mise enregistrée — elle s'appliquera au prochain mois.");
        form.reset();
      } else {
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
    <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contribution_amount">Nouvelle mise (à partir du prochain mois)</Label>
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
        Enregistrer la nouvelle mise
      </Button>
    </form>
  );
}
