"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prospectFormSchema, type ProspectFormValues } from "./schema";
import type { ProspectActionResult } from "./actions";

const emptyDefaults: ProspectFormValues = {
  first_name: "",
  last_name: "",
  phone: "",
  address: "",
  id_piece: "",
  contribution_amount: 0,
};

export function ProspectForm({
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  defaultValues?: Partial<ProspectFormValues>;
  onSubmit: (values: ProspectFormValues) => Promise<ProspectActionResult>;
  submitLabel: string;
}) {
  const [pending, setPending] = useState(false);
  const form = useForm<ProspectFormValues>({
    resolver: zodResolver(prospectFormSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  async function handleSubmit(values: ProspectFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (!result.success) {
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            if (field in emptyDefaults) {
              form.setError(field as keyof ProspectFormValues, { message: messages[0] });
            }
          }
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
        <Label htmlFor="first_name">Prénom</Label>
        <Input id="first_name" disabled={pending} {...form.register("first_name")} />
        {form.formState.errors.first_name && (
          <p className="text-sm text-destructive">{form.formState.errors.first_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="last_name">Nom</Label>
        <Input id="last_name" disabled={pending} {...form.register("last_name")} />
        {form.formState.errors.last_name && (
          <p className="text-sm text-destructive">{form.formState.errors.last_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input id="phone" type="tel" disabled={pending} {...form.register("phone")} />
        {form.formState.errors.phone && (
          <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input id="address" disabled={pending} {...form.register("address")} />
        {form.formState.errors.address && (
          <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="id_piece">Pièce d&apos;identité</Label>
        <Input id="id_piece" disabled={pending} {...form.register("id_piece")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contribution_amount">Cotisation prévue</Label>
        <Input
          id="contribution_amount"
          type="number"
          min={0}
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
        {submitLabel}
      </Button>
    </form>
  );
}
