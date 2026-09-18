"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HandCoinsIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { LoanActionResult } from "./actions";

/**
 * Single-purpose "hand the money over to the client" action for an approved loan —
 * only reachable once a loan is "approved" (see LoanActionDialog). Activating it here
 * is the only path that turns a loan "active" (DisburseLoanAction on the backend).
 */
export function LoanDisburseButton({
  onSubmit,
}: {
  onSubmit: () => Promise<LoanActionResult>;
}) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setPending(true);
    try {
      const result = await onSubmit();
      if (result.success) {
        toast.success("Prêt décaissé.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={pending}>
      {pending ? <Loader2Icon className="animate-spin" /> : <HandCoinsIcon />}
      Décaisser le prêt
    </Button>
  );
}
