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
import type { Microfinance } from "@/lib/types";
import { configurationFormSchema, type ConfigurationFormValues } from "./schema";
import type { ConfigurationActionResult } from "./actions";

type ConfigurationFormProps = {
  microfinances: Microfinance[];
  defaultValues?: Partial<ConfigurationFormValues>;
  onSubmit: (values: ConfigurationFormValues) => Promise<ConfigurationActionResult>;
  submitLabel: string;
};

const emptyDefaults: ConfigurationFormValues = {
  microfinance_id: "",
  key: "",
  value: "",
};

export function ConfigurationForm({
  microfinances,
  defaultValues,
  onSubmit,
  submitLabel,
}: ConfigurationFormProps) {
  const [pending, setPending] = useState(false);
  const form = useForm<ConfigurationFormValues>({
    resolver: zodResolver(configurationFormSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  async function handleSubmit(values: ConfigurationFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (!result.success) {
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            if (field in emptyDefaults) {
              form.setError(field as keyof ConfigurationFormValues, { message: messages[0] });
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
        <Label htmlFor="microfinance_id">Microfinance</Label>
        <Controller
          control={form.control}
          name="microfinance_id"
          render={({ field }) => (
            <Select
              items={microfinances.map((microfinance) => ({ value: microfinance.id, label: microfinance.name }))}
              value={field.value || null}
              onValueChange={field.onChange}
              disabled={pending}
            >
              <SelectTrigger id="microfinance_id" className="w-full">
                <SelectValue placeholder="Sélectionner une microfinance" />
              </SelectTrigger>
              <SelectContent>
                {microfinances.map((microfinance) => (
                  <SelectItem key={microfinance.id} value={microfinance.id}>
                    {microfinance.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.microfinance_id && (
          <p className="text-sm text-destructive">{form.formState.errors.microfinance_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="key">Clé</Label>
        <Input id="key" disabled={pending} {...form.register("key")} />
        {form.formState.errors.key && (
          <p className="text-sm text-destructive">{form.formState.errors.key.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">Valeur</Label>
        <Input id="value" disabled={pending} {...form.register("value")} />
        {form.formState.errors.value && (
          <p className="text-sm text-destructive">{form.formState.errors.value.message}</p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
