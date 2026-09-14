"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientEditFormSchema, type ClientEditFormValues } from "./schema";
import type { ClientActionResult } from "./actions";

type ClientEditFormProps = {
  defaultValues: ClientEditFormValues;
  onSubmit: (values: ClientEditFormValues) => Promise<ClientActionResult>;
};

export function ClientEditForm({ defaultValues, onSubmit }: ClientEditFormProps) {
  const [pending, setPending] = useState(false);
  const form = useForm<ClientEditFormValues>({
    resolver: zodResolver(clientEditFormSchema),
    defaultValues,
  });

  async function handleSubmit(values: ClientEditFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (result.success) {
        toast.success("Client mis à jour.");
      } else {
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            if (field in defaultValues) {
              form.setError(field as keyof ClientEditFormValues, { message: messages[0] });
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
      <div className="grid grid-cols-2 gap-4">
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

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        Enregistrer les modifications
      </Button>
    </form>
  );
}
