import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/login/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost" size="sm">
        <LogOutIcon />
        Déconnexion
      </Button>
    </form>
  );
}
