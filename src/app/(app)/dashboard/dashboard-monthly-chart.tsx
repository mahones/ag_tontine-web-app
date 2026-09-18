import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardMonthlyStats } from "@/lib/types";
import { formatAmount } from "@/lib/format-currency";
import { DashboardYearSelect } from "./dashboard-year-select";

const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

const numberFormatter = new Intl.NumberFormat("fr-FR");

/** Rounds up to a clean axis ceiling (1/2/2.5/5/10 × a power of ten). */
function niceMax(value: number): number {
  if (value <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate >= normalized) ?? 10;
  return step * magnitude;
}

export function DashboardMonthlyChart({ stats }: { stats: DashboardMonthlyStats }) {
  const max = niceMax(Math.max(...stats.cotisations, ...stats.loans, 1));
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((fraction) => Math.round(max * fraction));
  const totalCotisations = stats.cotisations.reduce((sum, value) => sum + value, 0);
  const totalLoans = stats.loans.reduce((sum, value) => sum + value, 0);

  return (
    <Card className="col-span-full">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Statistiques</CardTitle>
          <p className="text-sm text-muted-foreground">Cotisations et prêts par mois</p>
        </div>
        <DashboardYearSelect year={stats.year} />
      </CardHeader>
      <CardContent>
        <div className="flex items-stretch gap-3">
          <div className="flex h-56 flex-col justify-between py-1 text-right text-xs text-muted-foreground">
            {ticks.map((tick) => (
              <span key={tick}>{numberFormatter.format(tick)}</span>
            ))}
          </div>

          <div className="relative flex h-56 flex-1 items-end gap-1 border-l border-b">
            {ticks.map((tick) => (
              <div
                key={tick}
                className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border"
                style={{ bottom: `${(tick / max) * 100}%` }}
              />
            ))}

            {MONTH_LABELS.map((label, index) => {
              const cotisation = stats.cotisations[index] ?? 0;
              const loan = stats.loans[index] ?? 0;
              return (
                <div key={label} className="group/bar relative flex h-full flex-1 flex-col justify-end">
                  <div
                    role="group"
                    aria-label={`${label} ${stats.year} : cotisations ${numberFormatter.format(cotisation)}, prêts ${numberFormatter.format(loan)}`}
                    tabIndex={0}
                    className="relative z-10 flex h-full items-end justify-center gap-0.5 outline-none"
                  >
                    <div
                      className="w-full max-w-1.5 rounded-t-[4px] bg-chart-1 transition-opacity group-hover/bar:opacity-80"
                      style={{ height: `${(cotisation / max) * 100}%` }}
                    />
                    <div
                      className="w-full max-w-1.5 rounded-t-[4px] bg-chart-2 transition-opacity group-hover/bar:opacity-80"
                      style={{ height: `${(loan / max) * 100}%` }}
                    />

                    <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max -translate-x-1/2 space-y-1 rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover/bar:opacity-100 group-focus-within/bar:opacity-100">
                      <p className="font-medium">
                        {label} {stats.year}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span className="size-2 shrink-0 rounded-[2px] bg-chart-1" />
                        Cotisations : <span className="font-medium text-foreground">{formatAmount(cotisation)}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span className="size-2 shrink-0 rounded-[2px] bg-chart-2" />
                        Prêts : <span className="font-medium text-foreground">{formatAmount(loan)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-2 flex gap-3 pl-9">
          {MONTH_LABELS.map((label) => (
            <span key={label} className="flex-1 text-center text-xs text-muted-foreground">
              {label}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-[2px] bg-chart-1" />
            <span className="text-muted-foreground">Cotisations</span>
            <span className="font-medium">{formatAmount(totalCotisations)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-[2px] bg-chart-2" />
            <span className="text-muted-foreground">Prêts</span>
            <span className="font-medium">{formatAmount(totalLoans)}</span>
          </div>
        </div>

        <table className="sr-only">
          <caption>Cotisations et prêts par mois, {stats.year}</caption>
          <thead>
            <tr>
              <th scope="col">Mois</th>
              <th scope="col">Cotisations</th>
              <th scope="col">Prêts</th>
            </tr>
          </thead>
          <tbody>
            {MONTH_LABELS.map((label, index) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{numberFormatter.format(stats.cotisations[index] ?? 0)}</td>
                <td>{numberFormatter.format(stats.loans[index] ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
