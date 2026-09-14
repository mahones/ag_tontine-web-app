import { requireUser } from "@/lib/auth";
import { isDeveloper } from "@/lib/roles";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">
          Bienvenue, {user.first_name}.
        </p>
      </div>

      {isDeveloper(user) ? (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Microfinances</CardTitle>
            <CardDescription>
              Créez et gérez les microfinances de la plateforme depuis le menu « Microfinances ».
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Aucun module disponible pour l&apos;instant</CardTitle>
            <CardDescription>
              Les espaces propriétaire et agence sont en cours de construction.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
