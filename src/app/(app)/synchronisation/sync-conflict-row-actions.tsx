"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BanIcon, Loader2Icon, RotateCwIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { discardSyncOutboxItemAction, retrySyncOutboxItemAction } from "./actions";

export function SyncConflictRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  async function handleRetry() {
    setRetrying(true);
    const result = await retrySyncOutboxItemAction(id);
    setRetrying(false);

    if (result.success) {
      toast.success("Élément relancé — repris au prochain cycle de synchronisation.");
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  async function handleDiscard() {
    setDiscarding(true);
    const result = await discardSyncOutboxItemAction(id);
    setDiscarding(false);

    if (result.success) {
      setDiscardOpen(false);
      toast.success("Élément ignoré.");
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="flex justify-end gap-1.5">
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="icon-sm" onClick={handleRetry} disabled={retrying} />}>
          {retrying ? <Loader2Icon className="animate-spin" /> : <RotateCwIcon />}
          <span className="sr-only">Relancer</span>
        </TooltipTrigger>
        <TooltipContent>Relancer</TooltipContent>
      </Tooltip>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <Tooltip>
          <TooltipTrigger render={<AlertDialogTrigger render={<Button variant="destructive" size="icon-sm" />} />}>
            <BanIcon />
            <span className="sr-only">Ignorer</span>
          </TooltipTrigger>
          <TooltipContent>Ignorer</TooltipContent>
        </Tooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ignorer cet élément ?</AlertDialogTitle>
            <AlertDialogDescription>
              Il ne sera plus jamais retenté automatiquement. Cette action est irréversible — pour corriger, une
              nouvelle capture devra être ressaisie.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={discarding}>Annuler</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={discarding} onClick={handleDiscard}>
              {discarding && <Loader2Icon className="animate-spin" />}
              Ignorer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
