# Swipe-App

## Cloudflare D1 setup (free tier)

This app can run entirely on Cloudflare's free tier using D1 + Pages.

1. **Create the D1 database**
   - `wrangler d1 create swipe-game-db`
   - Copy the `database_id` into `wrangler.toml`.

2. **Apply schema + seed data**
   - `npm run db:migrate`
   - `npm run db:seed`

3. **Run locally with D1 bindings**
   - `npm run pages:preview`
   - Open `http://localhost:8788` (wrangler prints the exact URL).

4. **Deploy to Cloudflare Pages**
   - `npm run pages:deploy`

Notes:
- The API routes require D1; `next dev` won’t provide the `DB` binding.
- The free tier is enough for small projects; you only pay if you exceed limits.
