"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { createSession, deleteSession } from "@/lib/session";
import { ROLE_LEVEL } from "@/lib/roles";
import type { ApiEnvelope, AuthUser } from "@/lib/types";

const loginSchema = z.object({
  phone: z.string().min(1, "Le numéro de téléphone est requis."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export type LoginState = {
  error?: string;
} | null;

type LoginResponse = {
  token: string;
  token_type: string;
  user: AuthUser;
};

/** Returns an error message when `user` isn't allowed through this entry point, otherwise null. */
type RoleGuard = (user: AuthUser) => string | null;

async function performLogin(formData: FormData, guard: RoleGuard): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }

  let response: LoginResponse;
  try {
    response = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    return { error: "Impossible de contacter le serveur. Réessayez." };
  }

  const guardError = guard(response.user);
  if (guardError) {
    return { error: guardError };
  }

  await createSession(response.token, response.user);
  redirect("/dashboard");
}

/** /: general login, open to every role except Développeur (which must use /mode-developer). */
export async function generalLoginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  return performLogin(formData, (user) =>
    user.role?.level === ROLE_LEVEL.DEVELOPPEUR
      ? "Ce compte développeur doit se connecter depuis l'espace développeur."
      : null,
  );
}

/** /mode-developer: reserved to Développeur accounts. */
export async function developerLoginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  return performLogin(formData, (user) =>
    user.role?.level !== ROLE_LEVEL.DEVELOPPEUR ? "Ce compte n'est pas un compte développeur." : null,
  );
}

export async function logoutAction(): Promise<void> {
  try {
    await apiFetch<ApiEnvelope<null>>("/auth/logout", { method: "POST" });
  } catch {
    // Even if the server-side token revocation fails (e.g. already expired),
    // we still want to drop the local session.
  }
  await deleteSession();
  redirect("/");
}
