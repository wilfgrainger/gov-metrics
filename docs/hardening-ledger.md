# Hardening Ledger (Aggressive 10-Agent Pass)

Date: 2026-03-18

## Critical findings

1. Fixed: Nondeterministic E2E due to ambient server reuse on `:3000`.
2. Fixed: Smoke coverage only checked a subset of section pages.
3. Fixed: Missing automated live-feed canary for post-merge production validation.
4. Fixed: Worker endpoint contract tests were too narrow for ingest/refresh auth paths.

## Implemented controls

- Playwright now uses an isolated dedicated server (`PLAYWRIGHT_PORT` default `4173`) and never reuses existing servers.
- E2E includes app-identity verification and all section routes.
- New live canary script validates all automated feed sections and probes `/refresh` + `/ingest`.
- New `live-feed-canary.yml` workflow runs on push to `main`, schedule, and manual dispatch.
- Worker tests cover refresh auth, unknown sections, ingest method enforcement, non-ingest rejection, and malformed ingest payloads.
- Deploy workflow uploads Playwright artifacts for debugging.

## Manual follow-up required

- Verify production secrets and Wrangler/KV configuration.
- Execute one manual deploy, one manual ingest run, and one manual canary run.
- Confirm production frontend and Worker endpoints serve expected data before rollout close.
