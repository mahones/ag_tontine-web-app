"use client";

import { useActionState, useEffect } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import type { LoginState } from "@/lib/auth-actions";

type LoginFormProps = {
  action: (state: LoginState, formData: FormData) => Promise<LoginState>;
};

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(action, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-semibold">
          Téléphone
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="Ex : 07 00 00 00 00"
          required
          disabled={pending}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-semibold">
          Mot de passe
        </Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="h-11"
        />
      </div>

      <Button type="submit" className="h-11 w-full rounded-lg text-sm font-semibold" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        Se connecter
      </Button>
    </form>
  );
}
