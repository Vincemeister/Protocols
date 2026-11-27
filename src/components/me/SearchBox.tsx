"use client";

import { SearchField } from "@/components/ui";

/** A5: the search field as a plain GET form, so a search has an address that can be shared and reloaded. */
export function SearchBox({ query }: { query: string }) {
  return (
    <form action="/search" method="get">
      <SearchField name="q" value={query} size="lg" />
    </form>
  );
}
