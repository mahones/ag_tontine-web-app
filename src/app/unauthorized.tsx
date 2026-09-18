import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ErrorPage } from "@/components/error-page";

export const metadata = {
  title: "Non authentifié — Tontine",
};

// Rendered when `unauthorized()` (next/navigation) is thrown — requires the `authInterrupts`
// experimental flag (see next.config.ts). Nothing in this app calls unauthorized() yet:
// existing auth guards (lib/auth.ts) redirect to "/" instead, a deliberate, already-tested UX
// decision (see PENDING.md) that this page doesn't change. Ready to use if that ever changes.
export default function Unauthorized() {
  return (
    <ErrorPage
      code="401"
      tone="secondary"
      title="Session expirée"
      description="Reconnectez-vous pour continuer."
      actions={
        <Link href="/" className={buttonVariants({ variant: "secondary" })}>
          Se reconnecter
        </Link>
      }
    />
  );
}
