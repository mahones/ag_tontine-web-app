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
import type { Agency, Role } from "@/lib/types";
import { userFormSchema, type UserFormValues } from "./schema";
import type { UserActionResult } from "./actions";

type UserFormProps = {
  agencies: Agency[];
  roles: Role[];
  defaultValues?: Partial<UserFormValues>;
  onSubmit: (values: UserFormValues) => Promise<UserActionResult>;
  submitLabel: string;
  passwordHint: string;
};

const emptyDefaults: UserFormValues = {
  agency_id: "",
  role_id: "",
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  password: "",
  is_agent: false,
};

export function UserForm({
  agencies,
  roles,
  defaultValues,
  onSubmit,
  submitLabel,
  passwordHint,
}: UserFormProps) {
  const [pending, setPending] = useState(false);
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  async function handleSubmit(values: UserFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (!result.success) {
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            if (field in emptyDefaults) {
              form.setError(field as keyof UserFormValues, { message: messages[0] });
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

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" type="password" disabled={pending} {...form.register("password")} />
        <p className="text-xs text-muted-foreground">{passwordHint}</p>
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role_id">Rôle</Label>
        <Controller
          control={form.control}
          name="role_id"
          render={({ field }) => (
            <Select
              items={[{ value: "", label: "Aucun rôle" }, ...roles.map((role) => ({ value: role.id, label: role.name }))]}
              value={field.value || null}
              onValueChange={field.onChange}
              disabled={pending}
            >
              <SelectTrigger id="role_id" className="w-full">
                <SelectValue placeholder="Aucun rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun rôle</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.role_id && (
          <p className="text-sm text-destructive">{form.formState.errors.role_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="agency_id">Agence</Label>
        <Controller
          control={form.control}
          name="agency_id"
          render={({ field }) => (
            <Select
              items={[
                { value: "", label: "Aucune agence" },
                ...agencies.map((agency) => ({ value: agency.id, label: agency.name })),
              ]}
              value={field.value || null}
              onValueChange={field.onChange}
              disabled={pending}
            >
              <SelectTrigger id="agency_id" className="w-full">
                <SelectValue placeholder="Aucune agence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucune agence</SelectItem>
                {agencies.map((agency) => (
                  <SelectItem key={agency.id} value={agency.id}>
                    {agency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.agency_id && (
          <p className="text-sm text-destructive">{form.formState.errors.agency_id.message}</p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 rounded border-input" disabled={pending} {...form.register("is_agent")} />
        Agent de terrain (application mobile)
      </label>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
