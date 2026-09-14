"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  collectionCreateFormSchema,
  multipleOfContributionRefinement,
  type CollectionCreateFormValues,
} from "./schema";
import type { CollectionActionResult } from "./actions";

export function CollectionCreateForm({
  contributionAmount,
  onSubmit,
}: {
  contributionAmount: number;
  onSubmit: (values: CollectionCreateFormValues) => Promise<CollectionActionResult>;
}) {
  const [pending, setPending] = useState(false);
  const form = useForm<CollectionCreateFormValues>({
    resolver: zodResolver(
      collectionCreateFormSchema.refine(multipleOfContributionRefinement(contributionAmount), {
        message: `Le montant doit être un multiple de la cotisation mensuelle (${contributionAmount}).`,
        path: ["amount"],
      }),
    ),
  });

  async function handleSubmit(values: CollectionCreateFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (result.success) {
        toast.success("Cotisation enregistrée.");
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
        <Label htmlFor="amount">Montant versé</Label>
        <Input
          id="amount"
          type="number"
          min={contributionAmount}
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
        Enregistrer la cotisation
      </Button>
    </form>
  );
}
