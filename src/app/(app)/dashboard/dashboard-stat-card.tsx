import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatAmount } from "@/lib/format-currency";

const numberFormatter = new Intl.NumberFormat("fr-FR");

const TONE_CLASS = {
  orange: "bg-primary-subtle text-primary-subtle-foreground",
  navy: "bg-secondary-subtle text-secondary-subtle-foreground",
  green: "bg-success-subtle text-success-subtle-foreground",
  danger: "bg-danger-subtle text-danger-subtle-foreground",
} as const;

export function DashboardStatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "orange",
  isAmount = false,
}: {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  /** "danger" est réservé aux cartes qui demandent une action (ex. prêts en retard) —
   * le rouge doit rester rare pour garder sa valeur d'alerte. */
  tone?: keyof typeof TONE_CLASS;
  /** true quand `value` est un montant (FCFA) plutôt qu'un simple compteur. */
  isAmount?: boolean;
}) {
  return (
    <Card className="gap-3 border border-border shadow-sm">
      <div className="flex items-start justify-between px-(--card-spacing)">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${TONE_CLASS[tone]}`}>
          <Icon className="size-6" />
        </div>
      </div>
      <div className="px-(--card-spacing)">
        <p className={`font-mono text-[28px] leading-8 font-semibold tabular-nums ${tone === "danger" ? "text-danger-subtle-foreground" : "text-foreground"}`}>
          {isAmount ? formatAmount(value) : numberFormatter.format(value)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/80">{description}</p>
      </div>
    </Card>
  );
}
