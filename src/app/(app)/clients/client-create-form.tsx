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
import type { Prospect } from "@/lib/types";
import { clientCreateFormSchema, type ClientCreateFormValues } from "./schema";
import type { ClientActionResult } from "./actions";

type ClientCreateFormProps = {
  prospects: Prospect[];
  onSubmit: (values: ClientCreateFormValues) => Promise<ClientActionResult>;
};

const emptyDefaults: Partial<ClientCreateFormValues> = {
  prospect_id: "",
};

export function ClientCreateForm({ prospects, onSubmit }: ClientCreateFormProps) {
  const [pending, setPending] = useState(false);
  const form = useForm<ClientCreateFormValues>({
    resolver: zodResolver(clientCreateFormSchema),
    defaultValues: emptyDefaults,
  });

  async function handleSubmit(values: ClientCreateFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (!result.success) {
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            if (field === "prospect_id" || field === "contribution_amount") {
              form.setError(field, { message: messages[0] });
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
        <Label htmlFor="prospect_id">Prospect</Label>
        <Controller
          control={form.control}
          name="prospect_id"
          render={({ field }) => (
            <Select
              items={prospects.map((prospect) => ({
                value: prospect.id,
                label: `${prospect.first_name} ${prospect.last_name} (${prospect.phone})`,
              }))}
              value={field.value || null}
              onValueChange={field.onChange}
              disabled={pending}
            >
              <SelectTrigger id="prospect_id" className="w-full">
                <SelectValue placeholder="Sélectionner un prospect" />
              </SelectTrigger>
              <SelectContent>
                {prospects.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">Aucun prospect disponible</div>
                ) : (
                  prospects.map((prospect) => (
                    <SelectItem key={prospect.id} value={prospect.id}>
                      {prospect.first_name} {prospect.last_name} ({prospect.phone})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.prospect_id && (
          <p className="text-sm text-destructive">{form.formState.errors.prospect_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contribution_amount">Cotisation mensuelle</Label>
        <Input
          id="contribution_amount"
          type="number"
          min={200}
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
        Créer le client
      </Button>
    </form>
  );
}
