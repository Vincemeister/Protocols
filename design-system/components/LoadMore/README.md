# LoadMore

The sentinel row at the end of an infinite list (home feed, a profile's Products tab, search results): a 16px spinner with an `accent` arc and the words "Loading more" in `caption` `ink-muted`, `control-lg` tall. It appears when the next page is being fetched and disappears with the new cards; at the end of the list nothing is shown. The only spinner in the system apart from the product fetch.

The consumer provides `label`. Don't: a "Load more" button (scroll is the trigger); page numbers.
