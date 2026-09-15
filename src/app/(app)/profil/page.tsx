import { requireUser } from "@/lib/auth";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";

export const metadata = {
  title: "Mon profil — Tontine",
};

export default async function ProfilPage() {
  const user = await requireUser();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mon profil</h1>
        <p className="text-sm text-muted-foreground">
          Gérez vos informations personnelles et votre mot de passe de connexion.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Informations personnelles</h2>
        <ProfileForm user={user} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Mot de passe</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
