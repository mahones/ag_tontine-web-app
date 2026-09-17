"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import type { AuthUser } from "@/lib/types";
import { profileFormSchema, type ProfileFormValues } from "./schema";
import { updateProfileAction } from "./actions";

type ProfileFormProps = {
  user: AuthUser;
};

export function ProfileForm({ user }: ProfileFormProps) {
  const [pending, setPending] = useState(false);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      email: user.email,
      current_password: "",
    },
  });

  const needsCurrentPassword = Boolean(form.formState.dirtyFields.phone || form.formState.dirtyFields.email);

  async function handleSubmit(values: ProfileFormValues) {
    setPending(true);
    try {
      const result = await updateProfileAction(values);
      if (result.success) {
        toast.success("Profil mis à jour.");
        form.reset({ ...values, current_password: "" });
      } else {
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            if (field in form.getValues()) {
              form.setError(field as keyof ProfileFormValues, { message: messages[0] });
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

      {needsCurrentPassword && (
        <div className="space-y-2">
          <Label htmlFor="current_password">Mot de passe actuel</Label>
          <PasswordInput
            id="current_password"
            disabled={pending}
            {...form.register("current_password")}
          />
          <p className="text-xs text-muted-foreground">
            Requis pour confirmer le changement de téléphone ou d&apos;email.
          </p>
          {form.formState.errors.current_password && (
            <p className="text-sm text-destructive">{form.formState.errors.current_password.message}</p>
          )}
        </div>
      )}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        Enregistrer
      </Button>
    </form>
  );
}
