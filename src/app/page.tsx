import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";
import { generalLoginAction } from "@/lib/auth-actions";

export const metadata = {
  title: "Connexion — Tontine",
};

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-svh flex-1 items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Connexion</CardTitle>
          <CardDescription>
            Accédez à la console Tontine avec le compte fourni par votre administrateur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm action={generalLoginAction} />
        </CardContent>
      </Card>
    </div>
  );
}
