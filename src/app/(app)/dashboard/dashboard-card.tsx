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
    <Link href={href} className="block focus-visible:outline-none">
      <Card className="border border-border shadow-sm transition-colors hover:border-primary-border focus-visible:ring-2 focus-visible:ring-primary">
        <div className="flex items-start gap-4 px-(--card-spacing)">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary-subtle-foreground">
            <Icon className="size-6" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-2xl leading-7 font-semibold tabular-nums text-foreground">{count}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground/70">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
