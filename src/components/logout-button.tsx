import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/auth-actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="destructive" size="sm">
        <LogOutIcon />
        Déconnexion
      </Button>
    </form>
  );
}
