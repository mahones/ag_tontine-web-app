"use client";

import { useState } from "react";
import Link from "next/link";
import { HandCoinsIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoanCreateForm } from "./loan-create-form";
import { LoanApproveButton } from "./loan-approve-button";
import { LoanDisburseButton } from "./loan-disburse-button";
import {
  LOAN_STATUS_BADGE_VARIANT,
  LOAN_STATUS_LABELS,
  LOAN_TYPE_LABELS,
  type LoanCreateFormValues,
  type LoanStatusFormValues,
} from "./schema";
import type { LoanActionResult } from "./actions";
import type { Loan } from "@/lib/types";

type LoanActionDialogProps = {
  clientId: string;
  notebookId: string;
  canSubmit: boolean;
  canApprove: boolean;
  canDisburse: boolean;
  openLoan: Loan | null;
  onSubmitLoan: (values: LoanCreateFormValues) => Promise<LoanActionResult>;
  onUpdateStatus: ((values: LoanStatusFormValues) => Promise<LoanActionResult>) | null;
  onDisburse: (() => Promise<LoanActionResult>) | null;
};

export function LoanActionDialog({
  clientId,
  notebookId,
  canSubmit,
  canApprove,
  canDisburse,
  openLoan,
  onSubmitLoan,
  onUpdateStatus,
  onDisburse,
}: LoanActionDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <HandCoinsIcon />
        Octroyer un prêt
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Octroyer un prêt</DialogTitle>
        </DialogHeader>
        {openLoan ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ce carnet a déjà un prêt {LOAN_TYPE_LABELS[openLoan.type_loan]} de {openLoan.amount_loaned}{" "}
              — <Badge variant={LOAN_STATUS_BADGE_VARIANT[openLoan.status]}>{LOAN_STATUS_LABELS[openLoan.status]}</Badge>
              . Aucun nouveau prêt ne peut être soumis tant qu&apos;il n&apos;est pas soldé.
            </p>
            {openLoan.status === "pending" &&
              (canApprove && onUpdateStatus ? (
                <LoanApproveButton onSubmit={onUpdateStatus} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Vous n&apos;avez pas la permission d&apos;approuver ce prêt.
                </p>
              ))}
            {openLoan.status === "approved" &&
              (canDisburse && onDisburse ? (
                <LoanDisburseButton onSubmit={onDisburse} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Vous n&apos;avez pas la permission de décaisser ce prêt.
                </p>
              ))}
            <Link
              href={`/clients/${clientId}/carnets/${notebookId}/prets/${openLoan.id}`}
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Voir le prêt en détail
            </Link>
          </div>
        ) : canSubmit ? (
          <LoanCreateForm onSubmit={onSubmitLoan} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Vous n&apos;avez pas la permission de soumettre un prêt.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
