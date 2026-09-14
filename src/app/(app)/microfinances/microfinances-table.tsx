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
import type { Microfinance } from "@/lib/types";
import { DeleteMicrofinanceButton } from "./delete-microfinance-button";

export function MicrofinancesTable({ microfinances }: { microfinances: Microfinance[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return microfinances;
    return microfinances.filter((microfinance) =>
      [microfinance.name, microfinance.code, microfinance.country].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [microfinances, search]);

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, code ou pays…"
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
              <TableHead>Pays</TableHead>
              <TableHead>Couleur</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Aucune microfinance trouvée.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((microfinance) => (
                <TableRow key={microfinance.id}>
                  <TableCell className="font-mono text-xs">{microfinance.code}</TableCell>
                  <TableCell className="font-medium">{microfinance.name}</TableCell>
                  <TableCell>{microfinance.country}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block size-3.5 rounded-full border"
                        style={{ backgroundColor: microfinance.primary_color }}
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {microfinance.primary_color}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/microfinances/${microfinance.id}`}
                        className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                      >
                        <PencilIcon />
                        <span className="sr-only">Modifier {microfinance.name}</span>
                      </Link>
                      <DeleteMicrofinanceButton id={microfinance.id} name={microfinance.name} />
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
