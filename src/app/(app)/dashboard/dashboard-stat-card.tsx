import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const numberFormatter = new Intl.NumberFormat("fr-FR");

export function DashboardStatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        <p className="text-3xl font-semibold tracking-tight">{numberFormatter.format(value)}</p>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
