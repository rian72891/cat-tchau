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
- The static storefront loads products, accounts and orders from Lovable Cloud through public/catchau/account.js; orders are priced server-side by the place_order database function so cart prices can't be tampered with. Product ids equal array positions because cart keys rely on them.
- Keep the PC builder in separate static modules sharing the existing catalog and cart; unavailable component categories stay unavailable and compatibility stays unverified without authoritative specifications.
- Use the same Catchau logo asset for the storefront header and derived favicon to maintain a consistent identity.
