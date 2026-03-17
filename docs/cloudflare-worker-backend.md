# Cloudflare Worker Backend

## Goal

Move the data backend off GitHub Actions plus checked-in JSON and onto a Cloudflare Worker that can:

- fetch public-source metrics on demand
- refresh data on a schedule
- cache responses close to users
- serve the frontend directly

## Target architecture

1. Frontend calls `NEXT_PUBLIC_CF_WORKER_URL/metrics?section=...`.
2. Worker serves fresh cached data from KV when available.
3. Worker refreshes stale data in the background.
4. Cron trigger refreshes all supported sections every 4 hours.
5. In development, the client falls back to `GET /api/metrics?section=...`
   before using embedded data.

## Worker endpoints

- `GET /health`
- `GET /metrics?section=<section-id>`
- `GET /all`
- `POST /refresh?section=<section-id|all>` with `X-Refresh-Secret`
- `POST /ingest` for ingest-only sections such as `bettingOdds`

## Cache model

- Hot in-isolate cache: 60 seconds
- Fresh TTL: 4 hours
- Stale TTL: 24 hours
- Persistent cache: Cloudflare KV via `METRICS_CACHE`

Without KV, the worker still runs in memory for local development, but production should use KV.

## Supported live sections

- `sentimentPulse`
- `gdpTracker`
- `employmentStats`
- `nationalDebt`
- `taxRevenue`
- `migrationStats`
- `electionPolling`
- `nhsStats`
- `bettingOdds` via ingest

## Required Cloudflare setup

1. Authenticate Wrangler.
2. Create a KV namespace for `METRICS_CACHE`.
3. Paste the namespace IDs into `worker/wrangler.toml`.
4. Optionally set a refresh secret:
   - `npx wrangler secret put REFRESH_SECRET --config worker/wrangler.toml`
5. Deploy:
   - `npm run worker:deploy`

## Local development

- Frontend: `npm run dev`
- Worker: `npm run worker:dev`

Set `NEXT_PUBLIC_CF_WORKER_URL` in the frontend environment to point at the local or remote Worker.

If the Worker is unavailable in local development, the app now falls back to
`/api/metrics` for automated sections.

## Operational notes

- Cron runs in UTC.
- Refresh is at-least-once. Refresh handlers should remain idempotent.
- KV is eventually consistent, which is acceptable here because the data is read-heavy and refreshed on a coarse interval.
- The old `fetch_intel.py` script is now legacy and not part of the primary production path.
- Required GitHub secrets for production flows: `NEXT_PUBLIC_CF_WORKER_URL` and
  `WORKER_REFRESH_SECRET`.
