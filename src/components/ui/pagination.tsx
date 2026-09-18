"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/lib/types";

/** Windowed page list: first, last, current ± 1, with "…" gaps — never more than ~7 items. */
function getPageWindow(current: number, last: number): (number | "ellipsis")[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  const pages = new Set<number>([1, last, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= last).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
}

/** Numbered pager for a server-paginated list, driven by `PaginationMeta`. */
export function Pagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  if (meta.total === 0) return null;

  const pages = getPageWindow(meta.current_page, meta.last_page);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        {meta.total} résultat{meta.total > 1 ? "s" : ""} — page {meta.current_page} sur {meta.last_page}
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
        >
          <ChevronLeftIcon />
          <span className="sr-only">Page précédente</span>
        </Button>

        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-1.5 text-xs text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={page}
              type="button"
              variant={page === meta.current_page ? "default" : "outline"}
              size="icon-sm"
              className="tabular-nums"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
        >
          <ChevronRightIcon />
          <span className="sr-only">Page suivante</span>
        </Button>
      </div>
    </div>
  );
}
