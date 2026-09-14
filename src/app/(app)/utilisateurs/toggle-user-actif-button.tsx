"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, PowerIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleUserActifAction } from "./actions";

export function ToggleUserActifButton({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const result = await toggleUserActifAction(id);
    setPending(false);

    if (result.success) {
      toast.success(isActive ? "Utilisateur désactivé." : "Utilisateur activé.");
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Button variant="outline" size="icon-sm" disabled={pending} onClick={handleClick}>
      {pending ? <Loader2Icon className="animate-spin" /> : <PowerIcon />}
      <span className="sr-only">{isActive ? "Désactiver" : "Activer"}</span>
    </Button>
  );
}
