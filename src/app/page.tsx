import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthSplitLayout } from "@/components/auth-split-layout";
import { LoginForm } from "@/components/login-form";
import { generalLoginAction } from "@/lib/auth-actions";

export const metadata = {
  title: "Connexion — Tontine",
};

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <AuthSplitLayout
      title="Connexion"
      description="Accédez à la console Tontine avec le compte fourni par votre administrateur."
    >
      <LoginForm action={generalLoginAction} />
    </AuthSplitLayout>
  );
}
