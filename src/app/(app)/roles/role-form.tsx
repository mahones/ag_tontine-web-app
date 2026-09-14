"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { roleFormSchema, type RoleFormValues } from "./schema";
import type { RoleActionResult } from "./actions";

type RoleFormProps = {
  defaultValues?: Partial<RoleFormValues>;
  onSubmit: (values: RoleFormValues) => Promise<RoleActionResult>;
  submitLabel: string;
};

const emptyDefaults: RoleFormValues = {
  name: "",
  level: 4,
};

export function RoleForm({ defaultValues, onSubmit, submitLabel }: RoleFormProps) {
  const [pending, setPending] = useState(false);
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  async function handleSubmit(values: RoleFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (!result.success) {
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            if (field in emptyDefaults) {
              form.setError(field as keyof RoleFormValues, { message: messages[0] });
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
        <Label htmlFor="level">Niveau</Label>
        <Input
          id="level"
          type="number"
          min={0}
          step={1}
          disabled={pending}
          {...form.register("level", { valueAsNumber: true })}
        />
        <p className="text-xs text-muted-foreground">
          Plus le niveau est bas, plus le rôle a d&apos;autorité. Le niveau 0 contourne toutes les
          vérifications de permission (équivalent Développeur) — à réserver au rôle plateforme
          existant.
        </p>
        {form.formState.errors.level && (
          <p className="text-sm text-destructive">{form.formState.errors.level.message}</p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
