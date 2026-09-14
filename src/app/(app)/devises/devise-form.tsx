"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currencyFormSchema, type CurrencyFormValues } from "./schema";
import type { CurrencyActionResult } from "./actions";

type CurrencyFormProps = {
  defaultValues?: Partial<CurrencyFormValues>;
  onSubmit: (values: CurrencyFormValues) => Promise<CurrencyActionResult>;
  submitLabel: string;
};

const emptyDefaults: CurrencyFormValues = {
  code: "",
  name: "",
};

export function CurrencyForm({ defaultValues, onSubmit, submitLabel }: CurrencyFormProps) {
  const [pending, setPending] = useState(false);
  const form = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencyFormSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  async function handleSubmit(values: CurrencyFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (!result.success) {
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            if (field in emptyDefaults) {
              form.setError(field as keyof CurrencyFormValues, { message: messages[0] });
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
        <Label htmlFor="code">Code</Label>
        <Input id="code" disabled={pending} {...form.register("code")} />
        {form.formState.errors.code && (
          <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nom</Label>
        <Input id="name" disabled={pending} {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
