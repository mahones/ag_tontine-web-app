"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Syncs a paginated list's search box + page number to the URL (`?search=&page=`)
 * so the Server Component page above re-fetches the right page from the API on
 * navigation, instead of filtering/slicing a client-held array. Search resets the
 * page back to 1; page changes leave the current search untouched.
 *
 * `paramNames` namespaces the URL params (e.g. `staff_page`/`staff_search`) when a
 * page renders more than one independent paginated list — see `buildListQuery`.
 */
export function useListQuery(initialSearch: string, paramNames: { page?: string; search?: string } = {}) {
  const { page: pageParam = "page", search: searchParam = "search" } = paramNames;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearchInput] = useState(initialSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const navigate = useCallback(
    (next: { search?: string; page?: number }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.search !== undefined) {
        if (next.search) params.set(searchParam, next.search);
        else params.delete(searchParam);
        params.delete(pageParam);
      }

      if (next.page !== undefined) {
        if (next.page > 1) params.set(pageParam, String(next.page));
        else params.delete(pageParam);
      }

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname, searchParams, pageParam, searchParam],
  );

  function setSearch(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate({ search: value }), 400);
  }

  function setPage(page: number) {
    navigate({ page });
  }

  return { search, setSearch, setPage };
}
