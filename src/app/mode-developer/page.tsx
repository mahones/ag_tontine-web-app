import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthSplitLayout } from "@/components/auth-split-layout";
import { LoginForm } from "@/components/login-form";
import { developerLoginAction } from "@/lib/auth-actions";

export const metadata = {
  title: "Espace développeur — Tontine",
};

export default async function DeveloperLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <AuthSplitLayout
      eyebrow="Espace développeur"
      title="Connexion"
      description="Connexion réservée aux comptes développeur de la plateforme Tontine."
    >
      <LoginForm action={developerLoginAction} />
    </AuthSplitLayout>
  );
}
