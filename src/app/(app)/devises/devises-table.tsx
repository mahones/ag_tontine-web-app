"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PencilIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Currency } from "@/lib/types";
import { DeleteCurrencyButton } from "./delete-devise-button";

export function DevisesTable({ currencies }: { currencies: Currency[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return currencies;
    return currencies.filter((currency) =>
      [currency.code, currency.name].some((value) => value.toLowerCase().includes(query)),
    );
  }, [currencies, search]);

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par code ou nom…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                  Aucune devise trouvée.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((currency) => (
                <TableRow key={currency.id}>
                  <TableCell className="font-mono text-xs">{currency.code}</TableCell>
                  <TableCell className="font-medium">{currency.name}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/devises/${currency.id}`}
                        className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                      >
                        <PencilIcon />
                        <span className="sr-only">Modifier {currency.name}</span>
                      </Link>
                      <DeleteCurrencyButton id={currency.id} name={currency.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
