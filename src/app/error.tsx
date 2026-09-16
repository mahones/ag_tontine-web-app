"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ErrorPage } from "@/components/error-page";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorPage
      code="Erreur 500"
      tone="destructive"
      title="Une erreur est survenue"
      description="Quelque chose s'est mal passé de notre côté. Vous pouvez réessayer, ou revenir au tableau de bord."
      digest={error.digest}
      actions={
        <>
          <Button onClick={() => retry()}>Réessayer</Button>
          <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
            Tableau de bord
          </Link>
        </>
      }
    />
  );
}
