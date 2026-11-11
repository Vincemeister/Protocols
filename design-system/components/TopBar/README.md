# TopBar

The mobile header, `bar-mobile` (56px) tall, sticky at `z-nav`, on `surface-raised` with a `line` hairline below. Two forms: the **brand** form on the home feed and the signed-out landing (24px mark + "Favolist" wordmark at left, Notifications bell at right with an `accent` dot when unread), and the **page** form everywhere else (a 48px `chevron-left` back button, the page title centred in `heading-6`, one optional action at the right). Desktop screens have no TopBar; the SideNav carries the brand and the content column its own title.

The consumer provides `title` or `brand`, `onBack`, and one `action` (icon, label, onClick, badge). Don't: two actions on the right; a search field inside the bar (search is its own screen); a pink title.
