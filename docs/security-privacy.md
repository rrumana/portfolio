# Security and privacy

The production site is a public portfolio, not a visitor analytics system. Its desired data posture is to serve static content and browser-local WASM without creating a persistent identity for readers.

## Production rules

- No analytics SDKs, advertising pixels, fingerprinting, session replay, cross-site tracking, or server-issued visitor IDs.
- No visitor identity in cookies, response headers, local storage, or logs.
- A local-only theme preference is allowed when it is not transmitted or combined into an identifier.
- Do not collect form data because it might be useful later. Add collection only for a defined feature with a retention and deletion policy.
- Self-host fonts and essential assets. Review any third-party embed for network requests, cookies, and referrer leakage.
- Keep operational logs proportional to troubleshooting needs, minimize request metadata, restrict access, and use a short documented retention period.
- Do not expose internal endpoints, topology, credentials, deployment tokens, or private artifact locations in pages, client bundles, screenshots, logs, or error messages.

## Runtime surface

The Axum runtime serves generated Astro files, the browser WASM bundle, and `/healthz` and `/readyz` for platform probes. The retired `/api/logs` and `/api/game-of-life/*` routes are unavailable.

Request logs contain a fresh server-controlled request ID, method, path without its query string, status, and duration. The runtime does not create a visitor cookie or client ID and does not record an IP address, user agent, or referrer.

The supported runtime surface is:

- generated Astro files;
- the browser WASM bundle;
- `/healthz` and `/readyz` for platform probes.

Health endpoints reveal only the minimum state needed by the platform. Browser-side diagnostics remain local to the browser and are emitted only in local development.

## Release privacy checks

Against both staging and the production candidate, verify:

```bash
curl -sS -D - -o /dev/null https://HOST/
curl -sS -D - -o /dev/null https://HOST/projects/
curl -sS -o /dev/null -w '%{http_code}\n' https://HOST/api/logs
curl -sS -o /dev/null -w '%{http_code}\n' https://HOST/api/game-of-life/state
```

Before cutover:

- responses set no visitor cookie and return no client-ID header;
- retired API paths return `404` or `410` and the frontend makes no requests to them;
- browser storage contains no identity-bearing value;
- the network panel shows no analytics or unexpected third-party requests;
- logs contain no stable visitor identifier and follow the agreed minimization and retention policy;
- staging is blocked from indexing while production remains indexable.

Treat any failure as a production release blocker, not a documentation exception.
