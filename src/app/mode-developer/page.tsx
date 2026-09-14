import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";
import { developerLoginAction } from "@/lib/auth-actions";

export const metadata = {
  title: "Espace développeur — Tontine",
};

export default async function DeveloperLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-svh flex-1 items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Espace développeur</CardTitle>
          <CardDescription>
            Connexion réservée aux comptes développeur de la plateforme Tontine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm action={developerLoginAction} />
        </CardContent>
      </Card>
    </div>
  );
}
