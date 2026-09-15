"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordFormSchema, type PasswordFormValues } from "./schema";
import { changePasswordAction } from "./actions";

const emptyDefaults: PasswordFormValues = {
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
};

export function PasswordForm() {
  const [pending, setPending] = useState(false);
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: emptyDefaults,
  });

  async function handleSubmit(values: PasswordFormValues) {
    setPending(true);
    try {
      const result = await changePasswordAction(values);
      // On success the action redirects to /, so a returned result here is always a failure.
      if (!result.success) {
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            if (field in emptyDefaults) {
              form.setError(field as keyof PasswordFormValues, { message: messages[0] });
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
        <Label htmlFor="current_password">Mot de passe actuel</Label>
        <Input
          id="current_password"
          type="password"
          disabled={pending}
          {...form.register("current_password")}
        />
        {form.formState.errors.current_password && (
          <p className="text-sm text-destructive">{form.formState.errors.current_password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="new_password">Nouveau mot de passe</Label>
        <Input id="new_password" type="password" disabled={pending} {...form.register("new_password")} />
        {form.formState.errors.new_password && (
          <p className="text-sm text-destructive">{form.formState.errors.new_password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="new_password_confirmation">Confirmer le nouveau mot de passe</Label>
        <Input
          id="new_password_confirmation"
          type="password"
          disabled={pending}
          {...form.register("new_password_confirmation")}
        />
        {form.formState.errors.new_password_confirmation && (
          <p className="text-sm text-destructive">
            {form.formState.errors.new_password_confirmation.message}
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Vous serez déconnecté(e) après le changement et devrez vous reconnecter avec le nouveau mot de
        passe.
      </p>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        Changer le mot de passe
      </Button>
    </form>
  );
}
