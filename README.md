# POS Thai App

A Cloudflare-based POS web app with a Worker backend and Cloudflare D1 persistence.

## Features

- POS dashboard UI for sales and menu management
- Real state persistence through Cloudflare D1
- Worker routes for health and state APIs
- Deployable to Cloudflare Workers

## Project structure

- `index.html` — POS frontend
- `styles.css` — UI styling
- `worker.js` — Cloudflare Worker logic
- `wrangler.toml` — Worker and D1 configuration
- `schema.sql` — SQL schema for the D1 database
- `functions/api/health.js` and `functions/api/state.js` — API route helpers
- `cloudflare-pos-workflow.pdf` — workflow export

## Local development

```bash
cd /Users/80008467/Desktop/Pos-thai-app
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Cloudflare deployment

```bash
npx wrangler login
npx wrangler d1 create pos-thai-db
npx wrangler d1 execute pos-thai-db --remote --file=./schema.sql
npx wrangler deploy
```

## Live URL

```text
https://pos-thai-app.satesawa.workers.dev
```
