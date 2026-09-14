import { z } from "zod";

// Mirrors StoreCollectionRequest (amount required numeric).
export const collectionCreateFormSchema = z.object({
  amount: z.number({ error: "Le montant doit être un nombre." }).positive("Le montant doit être positif."),
});

export type CollectionCreateFormValues = z.infer<typeof collectionCreateFormSchema>;

// CreateCollectionAction additionally requires the amount to be an exact multiple of the
// notebook's current monthly contribution — enforced server-side by throwing a raw
// \Exception (no clean 422), so this client-side refinement exists purely to catch the
// common mistake before triggering that ugly error message.
export function multipleOfContributionRefinement(contributionAmount: number) {
  return (data: CollectionCreateFormValues) =>
    Math.round(data.amount * 100) % Math.round(contributionAmount * 100) === 0;
}
