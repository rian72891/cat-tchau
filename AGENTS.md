<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the uploaded Catchau storefront isolated as a static document embedded by the index route, because exact source fidelity and original external image URLs are required.
- The static storefront loads products, accounts and orders from Lovable Cloud through public/catchau/account.js; orders are priced server-side (place_order_checkout, including payment-method price, coupon and shipping) so cart prices can't be tampered with; client totals are display-only. Product ids equal array positions because cart keys rely on them.
- Keep the PC builder in separate static modules sharing the existing catalog and cart; unavailable component categories stay unavailable and compatibility stays unverified without authoritative specifications.
- Use the same Catchau logo asset for the storefront header and derived favicon to maintain a consistent identity.
- Serve footer information under a validated dynamic TanStack route embedding the static storefront; reuse authenticated order reads, and never treat a prepared contact download as a sent request.
- Storefront features beyond the original (home sections, departments menu/search, compare/favorites/history, checkout) live in their own static modules that hook into script.js globals and its catchau:* document events, so the original script stays close to the uploaded source.
- Checkout never collects card data or claims a charge: no payment gateway is integrated, so orders stay 'Aguardando pagamento'.
