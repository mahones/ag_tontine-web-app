"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { updateLoanStatusAction } from "@/app/(app)/clients/[id]/carnets/[notebookId]/prets/actions";
import type { Loan } from "@/lib/types";

/**
 * Quick approve/reject actions for a pending loan, right from a "Prêts en attente"
 * list (dashboard, microfinance/agency drill-down) — an alternative to opening the
 * loan detail page's full status form for the two decisions that matter here.
 */
export function PendingLoanActions({ loan }: { loan: Loan }) {
  const router = useRouter();
  const [pending, setPending] = useState<"approved" | "rejected" | null>(null);

  if (!loan.notebook?.client) return null;
  const { client, id: notebookId } = loan.notebook;

  async function handleDecision(status: "approved" | "rejected") {
    setPending(status);
    try {
      const result = await updateLoanStatusAction(loan.id, client.id, notebookId, { status });
      if (result.success) {
        toast.success(status === "approved" ? "Prêt approuvé." : "Prêt refusé.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex justify-end gap-1.5">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="icon-sm"
              disabled={pending !== null}
              onClick={() => handleDecision("approved")}
              className="border-green-500 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
            />
          }
        >
          {pending === "approved" ? <Loader2Icon className="animate-spin" /> : <CheckIcon />}
          <span className="sr-only">Approuver le prêt</span>
        </TooltipTrigger>
        <TooltipContent>Approuver</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="destructive"
              size="icon-sm"
              disabled={pending !== null}
              onClick={() => handleDecision("rejected")}
            />
          }
        >
          {pending === "rejected" ? <Loader2Icon className="animate-spin" /> : <XIcon />}
          <span className="sr-only">Refuser le prêt</span>
        </TooltipTrigger>
        <TooltipContent>Refuser</TooltipContent>
      </Tooltip>
    </div>
  );
}
