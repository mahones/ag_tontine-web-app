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
      code="Erreur 403"
      tone="destructive"
      title="Accès refusé"
      description="Vous n'avez pas la permission d'accéder à cette page."
      actions={
        <Link href="/dashboard" className={buttonVariants()}>
          Tableau de bord
        </Link>
      }
    />
  );
}
