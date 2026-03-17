# PULSE

Public metrics dashboard built with Next.js 16, TypeScript, Tailwind CSS v4, Recharts, and a Cloudflare Worker backend.

## Architecture

- Frontend: `app/`
- Primary backend: `worker/`
- Local development fallback: `app/api/metrics`
- Static frontend is supported; live data is served by the Worker

Detailed backend notes: [docs/cloudflare-worker-backend.md](./docs/cloudflare-worker-backend.md)

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Run the Worker backend in a separate terminal:

```bash
npm run worker:dev
```

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Recharts 3
- Cloudflare Workers
- Cloudflare KV

## Build

```bash
npm run build
```

## Worker deployment

The Worker is the primary live-data backend. It refreshes supported sections on cron and serves cached section payloads to the frontend.

Set `NEXT_PUBLIC_CF_WORKER_URL` in the frontend environment to point at the deployed Worker.
