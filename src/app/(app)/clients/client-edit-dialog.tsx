"use client";

import { useState } from "react";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClientEditForm } from "./client-edit-form";
import type { ClientEditFormValues } from "./schema";
import type { ClientActionResult } from "./actions";

type ClientEditDialogProps = {
  defaultValues: ClientEditFormValues;
  onSubmit: (values: ClientEditFormValues) => Promise<ClientActionResult>;
};

export function ClientEditDialog({ defaultValues, onSubmit }: ClientEditDialogProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(values: ClientEditFormValues) {
    const result = await onSubmit(values);
    if (result.success) setOpen(false);
    return result;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PencilIcon />
        Modifier
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Modifier le client</DialogTitle>
        </DialogHeader>
        <ClientEditForm defaultValues={defaultValues} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
