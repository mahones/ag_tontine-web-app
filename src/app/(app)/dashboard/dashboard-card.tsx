import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardCard({
  href,
  label,
  count,
  description,
}: {
  href: string;
  label: string;
  count: number;
  description: string;
}) {
  return (
    <Link href={href} className="block transition-opacity hover:opacity-80">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
          <p className="text-3xl font-semibold tracking-tight">{count}</p>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
