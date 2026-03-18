# Manual Rollout Checklist

## Pre-deploy

- Confirm GitHub secret `NEXT_PUBLIC_CF_WORKER_URL` points at the production Worker URL.
- Confirm GitHub secret `WORKER_REFRESH_SECRET` matches Worker secret `REFRESH_SECRET`.
- Confirm `worker/wrangler.toml` KV namespace IDs are correct for production.
- Confirm Wrangler auth is valid for the deployment account.

## Deploy and validate

- Run one manual GitHub Pages deploy (`deploy.yml`).
- Run one manual betting ingest workflow (`update-betting-odds.yml`).
- Run one manual live-feed canary workflow (`live-feed-canary.yml`).
- Verify frontend Pages URL and Worker URL both return live data for automated sections.

## Functional checks

- `GET /health` returns `status: ok`.
- `GET /all` contains `meta.sources` entries for all automated sections.
- `GET /metrics?section=bettingOdds` returns non-empty arrays.
- `POST /refresh?section=sentimentPulse` with secret returns `status: ok`.
- `POST /ingest` for `bettingOdds` with secret returns `status: ok`.

## Recovery

- If canary fails, pause rollout and inspect failing section and cache state.
- Re-run targeted refresh (`/refresh?section=<id>`) with secret.
- Re-run betting ingest workflow if failure involves `bettingOdds`.
- If Worker data remains degraded, rollback frontend deploy and investigate Worker/KV health.
