import type { ReactNode } from "react";

type ErrorTone = "primary" | "secondary" | "tertiary" | "destructive";

type ErrorPageProps = {
  /** Numéro d'erreur seul, ex. "404". */
  code: string;
  tone?: ErrorTone;
  title: string;
  description: string;
  digest?: string;
  actions: ReactNode;
};

const TONE_NUMBER_CLASS: Record<ErrorTone, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary-subtle-foreground",
  destructive: "text-destructive",
};

/**
 * Shared shell for not-found.tsx, error.tsx, forbidden.tsx and unauthorized.tsx (not
 * global-error.tsx, which must render its own <html>/<body> and can't depend on this or any
 * other app component). Numéro en Geist Mono, coloré par gravité, sans icône décorative —
 * outil métier, pas produit grand public (voir composant ErrorPage du système de design).
 */
export function ErrorPage({ code, tone = "primary", title, description, digest, actions }: ErrorPageProps) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-surface p-4 py-10">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface-raised p-6 text-center shadow-sm sm:p-8">
        <p className={`font-mono text-6xl leading-none font-bold ${TONE_NUMBER_CLASS[tone]}`}>{code}</p>

        <h1 className="mt-4 text-base font-semibold text-foreground">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        {digest && <p className="mt-2 font-mono text-xs text-muted-foreground/70">Référence : {digest}</p>}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{actions}</div>
      </div>
    </div>
  );
}
