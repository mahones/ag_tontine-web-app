"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const YEARS_BACK = 4;

/** Pushes `?year=` so the dashboard's Server Component re-fetches monthly stats for it. */
export function DashboardYearSelect({ year }: { year: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: YEARS_BACK + 1 }, (_, index) => currentYear - index);
  if (!years.includes(year)) years.unshift(year);

  function handleChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (Number(value) === currentYear) params.delete("year");
    else params.set("year", value);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <Select items={years.map((y) => ({ value: String(y), label: String(y) }))} value={String(year)} onValueChange={handleChange}>
      <SelectTrigger className="w-24" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {years.map((y) => (
          <SelectItem key={y} value={String(y)}>
            {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
