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
import { LICENCE_STATUS_LABELS, licenceFormSchema, type LicenceFormValues } from "./schema";
import type { LicenceActionResult } from "./actions";

type LicenceFormProps = {
  microfinances: Microfinance[];
  defaultValues?: Partial<LicenceFormValues>;
  onSubmit: (values: LicenceFormValues) => Promise<LicenceActionResult>;
  submitLabel: string;
};

const emptyDefaults: Partial<LicenceFormValues> = {
  microfinance_id: "",
  start_date: "",
  end_date: "",
  status: "active",
};

export function LicenceForm({ microfinances, defaultValues, onSubmit, submitLabel }: LicenceFormProps) {
  const [pending, setPending] = useState(false);
  const form = useForm<LicenceFormValues>({
    resolver: zodResolver(licenceFormSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  async function handleSubmit(values: LicenceFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (!result.success) {
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            if (field in emptyDefaults) {
              form.setError(field as keyof LicenceFormValues, { message: messages[0] });
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Date de début</Label>
          <Input id="start_date" type="date" disabled={pending} {...form.register("start_date")} />
          {form.formState.errors.start_date && (
            <p className="text-sm text-destructive">{form.formState.errors.start_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">Date de fin</Label>
          <Input id="end_date" type="date" disabled={pending} {...form.register("end_date")} />
          {form.formState.errors.end_date && (
            <p className="text-sm text-destructive">{form.formState.errors.end_date.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Statut</Label>
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <Select
              items={Object.entries(LICENCE_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
              value={field.value || null}
              onValueChange={field.onChange}
              disabled={pending}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LICENCE_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.status && (
          <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
