"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheckIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { LoanStatusFormValues } from "./schema";
import type { LoanActionResult } from "./actions";

/**
 * Single-purpose "approve this pending loan" action — replaces the old
 * approved/active/rejected status dropdown everywhere it appeared. Activating a
 * loan (approved -> active) or rejecting it has no UI entry point any more
 * (rejecting a still-pending loan stays available from the dashboard's
 * "Prêts en attente" quick actions, see PendingLoanActions).
 */
export function LoanApproveButton({
  onSubmit,
}: {
  onSubmit: (values: LoanStatusFormValues) => Promise<LoanActionResult>;
}) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setPending(true);
    try {
      const result = await onSubmit({ status: "approved" });
      if (result.success) {
        toast.success("Prêt approuvé.");
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
      {pending ? <Loader2Icon className="animate-spin" /> : <CircleCheckIcon />}
      Approuver le prêt
    </Button>
  );
}
