export type ListSearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_PER_PAGE = 15;

export type ListQueryParamNames = { page?: string; search?: string };

/**
 * Turns a page's awaited `searchParams` (`?search=&page=`) into the query
 * string appended to a paginated list endpoint. Shared by every list page so
 * the `page`/`per_page`/`search` param names stay consistent with
 * `PaginatesRequests` on the backend.
 *
 * `paramNames` lets a page that renders more than one independent paginated
 * list (e.g. Personnel + Clients on the same agency detail page) namespace
 * each one's URL params (`staff_page`/`clients_page`) instead of colliding on
 * a single shared `page`.
 */
export function buildListQuery(
  searchParams: ListSearchParams,
  perPage: number = DEFAULT_PER_PAGE,
  paramNames: ListQueryParamNames = {},
): string {
  const { page: pageParam = "page", search: searchParam = "search" } = paramNames;
  const query = new URLSearchParams();
  query.set("per_page", String(perPage));

  const page = searchParams[pageParam];
  const pageValue = Array.isArray(page) ? page[0] : page;
  if (pageValue) query.set("page", pageValue);

  const search = searchParams[searchParam];
  const searchValue = Array.isArray(search) ? search[0] : search;
  if (searchValue) query.set("search", searchValue);

  return `?${query.toString()}`;
}

export function currentSearchValue(searchParams: ListSearchParams, searchParam: string = "search"): string {
  const search = searchParams[searchParam];
  return (Array.isArray(search) ? search[0] : search) ?? "";
}
