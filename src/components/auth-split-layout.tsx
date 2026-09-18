import type { ReactNode } from "react";
import Image from "next/image";
import { CodeIcon } from "lucide-react";

type AuthSplitLayoutProps = {
  eyebrow?: string;
  title: string;
  description: string;
  /** "developer" renders the dark grid banner + badge used for the platform login. */
  variant?: "default" | "developer";
  children: ReactNode;
};

/**
 * Shared shell for the login screens — a single centered card: a decorative banner
 * carrying the brand mark, then the form body. Matches the Login component of the
 * E-Tontine design system (banner + card, not a full-bleed split screen).
 */
export function AuthSplitLayout({ eyebrow, title, description, variant = "default", children }: AuthSplitLayoutProps) {
  const isDeveloper = variant === "developer";

  return (
    <div className="flex min-h-svh items-center justify-center bg-surface p-4 py-10">
      <div className="w-full max-w-[400px] overflow-hidden rounded-xl border border-border bg-surface-raised shadow-md">
        <div
          className={`relative h-[120px] overflow-hidden ${isDeveloper ? "bg-gray-900" : "bg-secondary"}`}
        >
          {isDeveloper ? (
            <>
              <svg className="absolute inset-0 size-full opacity-[0.14]" preserveAspectRatio="none">
                <line x1="0" y1="20%" x2="100%" y2="20%" stroke="var(--secondary-subtle)" strokeWidth="1" />
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--secondary-subtle)" strokeWidth="1" />
                <line x1="0" y1="80%" x2="100%" y2="80%" stroke="var(--secondary-subtle)" strokeWidth="1" />
              </svg>
              <div className="absolute -top-10 -left-10 size-32 rounded-full bg-secondary opacity-40" />
              <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-white">
                <CodeIcon className="size-3" />
                Mode développeur
              </div>
            </>
          ) : (
            <>
              <div className="absolute -top-10 -right-8 size-40 rounded-full bg-tertiary opacity-[0.18]" />
              <div className="absolute -bottom-8 -left-8 size-32 rounded-full bg-primary opacity-25" />
            </>
          )}
          <div className="absolute bottom-4 left-5 flex items-center gap-2">
            <Image src="/assets/e-tontine-logo-mark.png" alt="" width={28} height={28} className="size-7 rounded-md" />
            <span className="text-sm font-medium text-white">E-Tontine</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-5 pt-6 pb-5">
          <div>
            {eyebrow && <p className="mb-1 text-xs font-medium text-muted-foreground">{eyebrow}</p>}
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
          <p className="text-center text-xs text-muted-foreground/70">
            {isDeveloper ? "Accès restreint — usage interne uniquement" : "E-Tontine · Console d'administration"}
          </p>
        </div>
      </div>
    </div>
  );
}
