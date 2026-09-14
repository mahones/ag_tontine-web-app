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
import type { Configuration, Microfinance } from "@/lib/types";
import { DeleteConfigurationButton } from "./delete-configuration-button";

export function ConfigurationsTable({
  configurations,
  microfinances,
}: {
  configurations: Configuration[];
  microfinances: Microfinance[];
}) {
  const [search, setSearch] = useState("");

  const microfinanceNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const microfinance of microfinances) map.set(microfinance.id, microfinance.name);
    return map;
  }, [microfinances]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return configurations;
    return configurations.filter((configuration) =>
      [configuration.key, configuration.value, microfinanceNames.get(configuration.microfinance_id) ?? ""].some(
        (value) => value.toLowerCase().includes(query),
      ),
    );
  }, [configurations, microfinanceNames, search]);

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par clé, valeur ou microfinance…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Microfinance</TableHead>
              <TableHead>Clé</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Aucune configuration trouvée.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((configuration) => (
                <TableRow key={configuration.id}>
                  <TableCell>
                    {microfinanceNames.get(configuration.microfinance_id) ?? configuration.microfinance_id}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{configuration.key}</TableCell>
                  <TableCell className="max-w-xs truncate">{configuration.value}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/configurations/${configuration.id}`}
                        className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                      >
                        <PencilIcon />
                        <span className="sr-only">Modifier {configuration.key}</span>
                      </Link>
                      <DeleteConfigurationButton id={configuration.id} name={configuration.key} />
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
