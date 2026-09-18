import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ErrorPage } from "@/components/error-page";

export const metadata = {
  title: "Accès refusé — Tontine",
};

// Rendered when `forbidden()` (next/navigation) is thrown — requires the `authInterrupts`
// experimental flag (see next.config.ts). Nothing in this app calls forbidden() yet: existing
// auth guards (lib/auth.ts) redirect to /dashboard instead, a deliberate, already-tested UX
// decision (see PENDING.md) that this page doesn't change. Ready to use if that ever changes.
export default function Forbidden() {
  return (
    <ErrorPage
      code="403"
      tone="tertiary"
      title="Accès refusé"
      description="Votre rôle ne permet pas d'accéder à cette page."
      actions={
        <Link href="/dashboard" className={buttonVariants({ variant: "tertiary" })}>
          Tableau de bord
        </Link>
      }
    />
  );
}
