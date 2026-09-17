import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SyncOutboxConflict } from "@/lib/types";
import { SyncConflictRowActions } from "./sync-conflict-row-actions";

const ENTITY_LABELS: Record<string, string> = {
  prospect: "Prospect",
  collection: "Cotisation",
  monthly_contribution: "Contribution mensuelle",
  repayment: "Remboursement",
  loan: "Prêt",
};

export function SyncConflictsTable({ conflicts, canManage }: { conflicts: SyncOutboxConflict[]; canManage: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Raison</TableHead>
            <TableHead>Tentatives</TableHead>
            <TableHead>Capturé le</TableHead>
            {canManage && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {conflicts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={canManage ? 5 : 4} className="py-8 text-center text-muted-foreground">
                Aucun conflit — tout est synchronisé.
              </TableCell>
            </TableRow>
          ) : (
            conflicts.map((conflict) => (
              <TableRow key={conflict.id}>
                <TableCell>
                  <Badge variant="secondary">{ENTITY_LABELS[conflict.entity_type] ?? conflict.entity_type}</Badge>
                </TableCell>
                <TableCell className="max-w-[320px] text-sm text-muted-foreground">
                  {conflict.reason ?? "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{conflict.attempt_count}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(conflict.created_at).toLocaleString("fr-FR")}
                </TableCell>
                {canManage && (
                  <TableCell>
                    <SyncConflictRowActions id={conflict.id} />
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
