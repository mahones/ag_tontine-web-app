import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ErrorPage } from "@/components/error-page";

export const metadata = {
  title: "Page introuvable — Tontine",
};

export default function NotFound() {
  return (
    <ErrorPage
      code="Erreur 404"
      title="Page introuvable"
      description="La page que vous cherchez n'existe pas, a été déplacée, ou vous n'y avez pas accès."
      actions={
        <Link href="/" className={buttonVariants()}>
          Retour à l&apos;accueil
        </Link>
      }
    />
  );
}
