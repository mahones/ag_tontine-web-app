"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Geist } from "next/font/google";
import { Button, buttonVariants } from "@/components/ui/button";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// global-error replaces the entire root layout (including <html>/<body>) when the root
// layout itself throws, so it can't rely on layout.tsx or any component tree beneath it —
// it imports its own copy of globals.css/Geist and stays deliberately minimal.
export default function GlobalError({
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
    <html lang="fr" className={`${geistSans.variable} antialiased`}>
      <body className="flex min-h-svh items-center justify-center bg-background p-4 text-foreground">
        <div className="w-full max-w-sm rounded-lg border border-border bg-surface-raised p-6 text-center shadow-sm sm:p-8">
          <p className="font-mono text-6xl leading-none font-bold text-destructive">500</p>
          <h1 className="mt-4 text-base font-semibold tracking-tight">Une erreur inattendue est survenue</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            L&apos;application n&apos;a pas pu s&apos;afficher. Vous pouvez réessayer, ou revenir à l&apos;accueil.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-muted-foreground/70">Référence : {error.digest}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => retry()}>Réessayer</Button>
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
