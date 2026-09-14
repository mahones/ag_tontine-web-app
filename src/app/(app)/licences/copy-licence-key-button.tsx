"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyLicenceKeyButton({ licenceKey }: { licenceKey: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(licenceKey);
      setCopied(true);
      toast.success("Clé de licence copiée.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Impossible de copier la clé.");
    }
  }

  return (
    <Button type="button" variant="outline" size="icon-sm" className="shrink-0" onClick={handleCopy}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span className="sr-only">Copier la clé de licence</span>
    </Button>
  );
}
