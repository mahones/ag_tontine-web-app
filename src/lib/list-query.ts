export type ListSearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_PER_PAGE = 15;

/**
 * Turns a page's awaited `searchParams` (`?search=&page=`) into the query
 * string appended to a paginated list endpoint. Shared by every list page so
 * the `page`/`per_page`/`search` param names stay consistent with
 * `PaginatesRequests` on the backend.
 */
export function buildListQuery(searchParams: ListSearchParams, perPage: number = DEFAULT_PER_PAGE): string {
  const query = new URLSearchParams();
  query.set("per_page", String(perPage));

  const page = searchParams.page;
  const pageValue = Array.isArray(page) ? page[0] : page;
  if (pageValue) query.set("page", pageValue);

  const search = searchParams.search;
  const searchValue = Array.isArray(search) ? search[0] : search;
  if (searchValue) query.set("search", searchValue);

  return `?${query.toString()}`;
}

export function currentSearchValue(searchParams: ListSearchParams): string {
  const search = searchParams.search;
  return (Array.isArray(search) ? search[0] : search) ?? "";
}
