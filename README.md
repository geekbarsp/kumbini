# Kumbini

A production-ready Filipino craft e-commerce storefront built with Next.js, TypeScript, Tailwind CSS, and libSQL.

## Features

- Searchable, filterable product catalog
- Product quick views and saved items
- Persistent shopping cart
- Stock-validated checkout with COD and bank transfer
- Durable orders, line items, inventory, and order tracking
- Responsive storefront and social-sharing metadata

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Local development automatically uses `local.db`; no database account is required.

## Deploy to Vercel

1. Create a libSQL database and token at [Turso](https://turso.tech).
2. Import this GitHub repository into Vercel.
3. Add `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, and `NEXT_PUBLIC_SITE_URL` using `.env.example` as a guide.
4. Deploy. Tables and the initial catalog are created automatically on first use.

```bash
npm run build
```
