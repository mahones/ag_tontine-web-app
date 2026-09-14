import type { Licence } from "@/lib/types";

/**
 * Picks the licence to display for a microfinance: the active one with the latest
 * end_date if there are several, otherwise just the licence with the latest end_date
 * (so an expired/revoked microfinance still shows something meaningful).
 */
export function pickCurrentLicence(licences: Licence[]): Licence | null {
  if (licences.length === 0) return null;
  const active = licences.filter((licence) => licence.status === "active");
  const pool = active.length > 0 ? active : licences;
  return pool.reduce((latest, licence) => (licence.end_date > latest.end_date ? licence : latest));
}

/** Whole days remaining until `dateStr` (YYYY-MM-DD), negative once past. */
export function daysUntil(dateStr: string): number {
  const end = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}
