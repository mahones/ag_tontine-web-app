"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EyeIcon, SearchIcon } from "lucide-react";
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
import type { Client } from "@/lib/types";
import { formatPersonName } from "@/lib/format-name";

export function ClientsTable({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) =>
      [client.first_name, client.last_name, client.phone, client.address].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [clients, search]);

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, téléphone, adresse…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Aucun client trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    {formatPersonName(client.first_name, client.last_name)}
                  </TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{client.address}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/clients/${client.id}`}
                        className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                      >
                        <EyeIcon />
                        <span className="sr-only">
                          Voir {formatPersonName(client.first_name, client.last_name)}
                        </span>
                      </Link>
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
