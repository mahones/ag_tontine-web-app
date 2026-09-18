"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HandCoinsIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { disburseLoanAction } from "@/app/(app)/clients/[id]/carnets/[notebookId]/prets/actions";
import type { Loan } from "@/lib/types";

/**
 * One-click "Décaisser" for an approved loan, right from the "Prêts" list — mirrors
 * PendingLoanActions' one-click approve/reject for pending loans.
 */
export function LoanDisburseAction({ loan }: { loan: Loan }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (!loan.notebook?.client) return null;
  const { client, id: notebookId } = loan.notebook;

  async function handleClick() {
    setPending(true);
    try {
      const result = await disburseLoanAction(loan.id, client.id, notebookId);
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
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="outline" size="icon-sm" disabled={pending} onClick={handleClick} />}
      >
        {pending ? <Loader2Icon className="animate-spin" /> : <HandCoinsIcon />}
        <span className="sr-only">Décaisser le prêt</span>
      </TooltipTrigger>
      <TooltipContent>Décaisser</TooltipContent>
    </Tooltip>
  );
}
