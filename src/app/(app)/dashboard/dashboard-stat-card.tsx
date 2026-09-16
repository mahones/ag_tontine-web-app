import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

const numberFormatter = new Intl.NumberFormat("fr-FR");

export function DashboardStatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="group relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-primary/20">
      <div className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start gap-4 px-(--card-spacing)">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#FDF0E8] shadow-sm ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <Icon className="size-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold tracking-tight">{numberFormatter.format(value)}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-xs text-muted-foreground/70">{description}</p>
        </div>
      </div>
    </Card>
  );
}
