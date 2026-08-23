# Cloudflare setup for POS app

This project is a static HTML/CSS app, so the recommended Cloudflare setup is:

- Cloudflare Pages: host the frontend
- Cloudflare D1: store menu, orders, inventory, and expenses
- Cloudflare Workers / Pages Functions: expose API endpoints for your app

## 1) Create D1 database

```bash
npx wrangler d1 create pos-thai-db
```

Copy the generated `database_id` into `wrangler.toml`.

## 2) Apply schema

```bash
npx wrangler d1 execute pos-thai-db --file=./schema.sql
```

## 3) Deploy frontend to Pages

1. Push this project to GitHub.
2. In Cloudflare Dashboard -> Workers & Pages -> Create application -> Pages -> Connect to Git.
3. Set the production branch and deploy.
4. Use the project root as the build output directory (static site, no build step needed).

## 4) Add API endpoints

The app can call routes such as:

- `/api/health`
- `/api/products`
- `/api/categories`
- `/api/orders`
- `/api/expenses`

Example route file:

- `functions/api/health.js`

## 5) Example API call from the frontend

```js
const res = await fetch('/api/products');
const products = await res.json();
```

## 6) Notes

- For a true production POS, you should replace the in-browser demo data with API-backed data from D1.
- In production, use Cloudflare Access or authentication for admin screens.
- Use Cloudflare R2 if you later want image uploads for menu items.

## 7) Useful commands

```bash
npx wrangler d1 list
npx wrangler d1 execute pos-thai-db --command "SELECT * FROM products LIMIT 5;"
npx wrangler pages deploy .
```
