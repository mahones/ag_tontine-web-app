"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { managedUserFormSchema, type ManagedUserFormValues } from "./schema";
import type { UserActionResult } from "./actions";

type ManagedUserFormProps = {
  defaultValues: ManagedUserFormValues;
  onSubmit: (values: ManagedUserFormValues) => Promise<UserActionResult>;
};

export function ManagedUserForm({ defaultValues, onSubmit }: ManagedUserFormProps) {
  const [pending, setPending] = useState(false);
  const form = useForm<ManagedUserFormValues>({
    resolver: zodResolver(managedUserFormSchema),
    defaultValues,
  });

  async function handleSubmit(values: ManagedUserFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (!result.success) {
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            if (field in defaultValues) {
              form.setError(field as keyof ManagedUserFormValues, { message: messages[0] });
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
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" disabled={pending} {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 rounded border-input" disabled={pending} {...form.register("is_agent")} />
        Agent de terrain (application mobile)
      </label>

      <p className="text-xs text-muted-foreground">
        Le rôle, l&apos;agence et le mot de passe de cet utilisateur ne sont pas modifiables depuis cet
        écran.
      </p>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        Enregistrer les modifications
      </Button>
    </form>
  );
}
