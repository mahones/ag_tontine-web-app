import type { ReactNode } from "react";
import Image from "next/image";

type AuthSplitLayoutProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
};

/**
 * Shared shell for the login screens: a single centered card whose illustration
 * panel is flush against the form (no gap, no rounded corners), matching the
 * shared design reference. Colors stay on the app's current black/white theme.
 */
export function AuthSplitLayout({ eyebrow, title, description, children }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4 py-10">
      <div className="flex w-full max-w-4xl border border-border bg-card">
        <div className="hidden w-1/2 shrink-0 bg-muted lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element -- temporary online placeholder */}
          <img
            src="https://picsum.photos/seed/tontine-login/900/1400"
            alt=""
            className="h-full w-full object-cover grayscale"
          />
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">
            <Image
              src="/assets/e-tontine-logo-mark.png"
              alt="E-Tontine"
              width={245}
              height={253}
              className="mx-auto mb-6 block h-24 w-auto"
              priority
            />
            {eyebrow && <p className="mb-2 text-sm font-medium text-muted-foreground">{eyebrow}</p>}
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
