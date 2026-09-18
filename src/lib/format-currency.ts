// Convention produit : séparateur de milliers = espace fine, devise toujours en suffixe
// ("125 000 FCFA", jamais "125,000" ni "125.000" ni un préfixe). Voir le système de design.
const amountFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function formatAmount(value: number | string): string {
  const numeric = typeof value === "string" ? Number(value) : value;
  return `${amountFormatter.format(Number.isFinite(numeric) ? numeric : 0)} FCFA`;
}
