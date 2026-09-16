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
import type { Currency } from "@/lib/types";
import { agencyFormSchema, type AgencyFormValues } from "./schema";
import type { AgencyActionResult } from "./actions";

type AgencyFormProps = {
  // Only passed (and the currency picker only rendered) at creation — see schema.ts for why
  // the edit form still needs currency_id in its default values despite hiding this field.
  currencies?: Currency[];
  defaultValues?: Partial<AgencyFormValues>;
  onSubmit: (values: AgencyFormValues) => Promise<AgencyActionResult>;
  submitLabel: string;
};

const emptyDefaults: AgencyFormValues = {
  name: "",
  address: "",
  phone: "",
  is_headquarters: false,
  currency_id: "",
};

export function AgencyForm({ currencies, defaultValues, onSubmit, submitLabel }: AgencyFormProps) {
  const [pending, setPending] = useState(false);
  const form = useForm<AgencyFormValues>({
    resolver: zodResolver(agencyFormSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  async function handleSubmit(values: AgencyFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (!result.success) {
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            if (field in emptyDefaults) {
              form.setError(field as keyof AgencyFormValues, { message: messages[0] });
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
      {currencies && (
        <div className="space-y-2">
          <Label htmlFor="currency_id">Devise</Label>
          <Controller
            control={form.control}
            name="currency_id"
            render={({ field }) => (
              <Select
                items={currencies.map((currency) => ({ value: currency.id, label: `${currency.code} — ${currency.name}` }))}
                value={field.value || null}
                onValueChange={field.onChange}
                disabled={pending}
              >
                <SelectTrigger id="currency_id" className="w-full">
                  <SelectValue placeholder="Sélectionner une devise" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id}>
                      {currency.code} — {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.currency_id && (
            <p className="text-sm text-destructive">{form.formState.errors.currency_id.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nom</Label>
        <Input id="name" disabled={pending} {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
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
        <Label htmlFor="phone">Téléphone</Label>
        <Input id="phone" type="tel" disabled={pending} {...form.register("phone")} />
        {form.formState.errors.phone && (
          <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 rounded border-input"
          disabled={pending}
          {...form.register("is_headquarters")}
        />
        Siège de la microfinance
      </label>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
