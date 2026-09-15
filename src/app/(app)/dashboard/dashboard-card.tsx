import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function DashboardCard({
  href,
  label,
  count,
  description,
  icon: Icon,
}: {
  href: string;
  label: string;
  count: number;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link href={href} className="block transition-opacity hover:opacity-80">
      <Card>
        <div className="flex items-start gap-4 px-(--card-spacing)">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted ring-1 ring-foreground/10">
            <Icon className="size-5 text-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-semibold tracking-tight">{count}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground/70">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
