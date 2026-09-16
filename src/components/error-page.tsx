import Image from "next/image";
import type { ReactNode } from "react";

type ErrorPageProps = {
  /** Big, prominent status line, e.g. "Erreur 404". */
  code: string;
  tone?: "primary" | "destructive";
  title: string;
  description: string;
  digest?: string;
  actions: ReactNode;
};

/**
 * Shared shell for not-found.tsx, error.tsx, forbidden.tsx and unauthorized.tsx (not
 * global-error.tsx, which must render its own <html>/<body> and can't depend on this or any
 * other app component).
 */
export function ErrorPage({ code, tone = "primary", title, description, digest, actions }: ErrorPageProps) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4 py-10">
      <div className="w-full max-w-md text-center">
        <Image
          src="/assets/e-tontine-logo-mark.png"
          alt="E-Tontine"
          width={245}
          height={253}
          className="mx-auto mb-6 block h-16 w-auto"
          priority
        />

        <p
          className={`text-5xl font-extrabold tracking-tight sm:text-6xl ${
            tone === "destructive" ? "text-destructive" : "text-primary"
          }`}
        >
          {code}
        </p>

        <h1 className="mt-3 text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {digest && <p className="mt-2 font-mono text-xs text-muted-foreground/70">Référence : {digest}</p>}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div>
      </div>
    </div>
  );
}
