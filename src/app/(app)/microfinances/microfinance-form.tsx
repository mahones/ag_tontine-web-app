"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { microfinanceFormSchema, type MicrofinanceFormValues } from "./schema";
import type { MicrofinanceActionResult } from "./actions";

type MicrofinanceFormProps = {
  defaultValues?: Partial<MicrofinanceFormValues>;
  onSubmit: (values: MicrofinanceFormValues) => Promise<MicrofinanceActionResult>;
  submitLabel: string;
};

const emptyDefaults: MicrofinanceFormValues = {
  name: "",
  country: "",
  logo: "",
  primary_color: "#1E3A8A",
  local_server_url: "",
};

export function MicrofinanceForm({ defaultValues, onSubmit, submitLabel }: MicrofinanceFormProps) {
  const [pending, setPending] = useState(false);
  const form = useForm<MicrofinanceFormValues>({
    resolver: zodResolver(microfinanceFormSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  const primaryColor = form.watch("primary_color");

  async function handleSubmit(values: MicrofinanceFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      // A successful create/update redirects server-side and never returns here.
      if (!result.success) {
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            if (field in emptyDefaults) {
              form.setError(field as keyof MicrofinanceFormValues, { message: messages[0] });
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
        <Label htmlFor="name">Nom</Label>
        <Input id="name" disabled={pending} {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Pays</Label>
        <Input id="country" disabled={pending} {...form.register("country")} />
        {form.formState.errors.country && (
          <p className="text-sm text-destructive">{form.formState.errors.country.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="primary_color">Couleur principale</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label="Sélecteur de couleur"
            className="h-9 w-9 shrink-0 cursor-pointer rounded-md border p-1"
            value={/^#([0-9a-fA-F]{6})$/.test(primaryColor) ? primaryColor : "#1E3A8A"}
            onChange={(event) => form.setValue("primary_color", event.target.value, { shouldValidate: true })}
            disabled={pending}
          />
          <Input id="primary_color" disabled={pending} {...form.register("primary_color")} />
        </div>
        {form.formState.errors.primary_color && (
          <p className="text-sm text-destructive">{form.formState.errors.primary_color.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo (URL, optionnel)</Label>
        <Input id="logo" disabled={pending} {...form.register("logo")} />
        {form.formState.errors.logo && (
          <p className="text-sm text-destructive">{form.formState.errors.logo.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="local_server_url">URL du serveur local</Label>
        <Input id="local_server_url" disabled={pending} {...form.register("local_server_url")} />
        {form.formState.errors.local_server_url && (
          <p className="text-sm text-destructive">{form.formState.errors.local_server_url.message}</p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
